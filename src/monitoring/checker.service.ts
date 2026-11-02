import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CheckStatus, Monitor } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { IncidentService } from './incident.service.js';
import { NotifierService } from './notifier.service.js';

export type CheckOutcome = {
  status: CheckStatus;
  httpStatusCode: number | null;
  responseTimeMs: number | null;
  errorType: string | null;
  errorMessage: string | null;
};

const USER_AGENT = 'SitePulse/1.0 (+uptime monitor)';

@Injectable()
export class CheckerService {
  private readonly logger = new Logger(CheckerService.name);
  private readonly inFlight = new Set<number>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly incidents: IncidentService,
    private readonly notifier: NotifierService,
    private readonly config: ConfigService,
  ) {}

  private get failureThreshold(): number {
    const n = Number(
      this.config.get<string>('INCIDENT_FAILURE_THRESHOLD', '3'),
    );
    return Number.isFinite(n) && n > 0 ? n : 3;
  }

  /** Background entry point. Silently skips missing/inactive monitors. */
  async checkMonitorById(id: number): Promise<CheckOutcome | null> {
    if (this.inFlight.has(id)) return null;
    const monitor = await this.prisma.monitor.findUnique({ where: { id } });
    if (!monitor || !monitor.isActive) return null;
    return this.withLock(monitor);
  }

  /** Manual entry point. The caller has already verified ownership. */
  checkMonitor(monitor: Monitor): Promise<CheckOutcome> {
    if (this.inFlight.has(monitor.id)) {
      throw new ConflictException('A check is already running for this monitor');
    }
    return this.withLock(monitor);
  }

  private async withLock(monitor: Monitor): Promise<CheckOutcome> {
    this.inFlight.add(monitor.id);
    try {
      return await this.perform(monitor);
    } finally {
      this.inFlight.delete(monitor.id);
    }
  }

  private async perform(monitor: Monitor): Promise<CheckOutcome> {
    const outcome = await this.probe(monitor.url, monitor.timeoutMs);
    const now = new Date();

    // 1. Append immutable history.
    await this.prisma.checkResult.create({
      data: { monitorId: monitor.id, ...outcome },
    });

    if (outcome.status === 'SUCCESS') {
      // 2a. Recovered — refresh cache, reset failures, close any open incident.
      await this.prisma.monitor.update({
        where: { id: monitor.id },
        data: {
          currentStatus: 'UP',
          lastCheckedAt: now,
          lastResponseTimeMs: outcome.responseTimeMs,
          consecutiveFailures: 0,
        },
      });
      const incident = await this.incidents.onRecovery(monitor.id);
      if (incident) await this.notifier.notifyRecovery(monitor, incident);
    } else {
      // 2b. Failure — bump the counter, open an incident once the threshold is met.
      const updated = await this.prisma.monitor.update({
        where: { id: monitor.id },
        data: {
          currentStatus: 'DOWN',
          lastCheckedAt: now,
          lastResponseTimeMs: outcome.responseTimeMs,
          consecutiveFailures: { increment: 1 },
        },
      });
      const incident = await this.incidents.onFailure(
        monitor.id,
        updated.consecutiveFailures,
        this.failureThreshold,
        outcome.errorType,
        outcome.errorMessage,
      );
      if (incident) await this.notifier.notifyDown(monitor, incident);
    }

    return outcome;
  }

  private async probe(url: string, timeoutMs: number): Promise<CheckOutcome> {
    const started = performance.now();
    try {
      const res = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        signal: AbortSignal.timeout(timeoutMs),
        headers: { 'user-agent': USER_AGENT },
      });
      const responseTimeMs = elapsedSince(started);
      const ok = res.status >= 200 && res.status < 400;
      return {
        status: ok ? 'SUCCESS' : 'HTTP_ERROR',
        httpStatusCode: res.status,
        responseTimeMs,
        errorType: ok ? null : 'HTTP_STATUS',
        errorMessage: ok ? null : `HTTP ${res.status} ${res.statusText}`,
      };
    } catch (error) {
      return classify(error, elapsedSince(started));
    }
  }
}

function elapsedSince(started: number): number {
  return Math.max(0, Math.round(performance.now() - started));
}

function classify(error: unknown, responseTimeMs: number): CheckOutcome {
  const err = error instanceof Error ? error : new Error(String(error));
  const msg = err.message ?? '';

  if (err.name === 'TimeoutError' || err.name === 'AbortError') {
    return {
      status: 'TIMEOUT',
      httpStatusCode: null,
      responseTimeMs,
      errorType: 'TIMEOUT',
      errorMessage: 'Request timed out',
    };
  }
  if (/tls|ssl|certificate/i.test(msg)) {
    return {
      status: 'SSL_ERROR',
      httpStatusCode: null,
      responseTimeMs,
      errorType: 'SSL',
      errorMessage: truncate(msg),
    };
  }
  if (
    err.name === 'TypeError' ||
    /fetch failed|ENOTFOUND|ECONNREFUSED|ECONNRESET|ECONNABORTED/i.test(msg)
  ) {
    return {
      status: 'CONNECTION_ERROR',
      httpStatusCode: null,
      responseTimeMs,
      errorType: 'CONNECTION',
      errorMessage: truncate(msg),
    };
  }
  return {
    status: 'UNKNOWN_ERROR',
    httpStatusCode: null,
    responseTimeMs,
    errorType: 'UNKNOWN',
    errorMessage: truncate(msg),
  };
}

function truncate(msg: string, max = 255): string {
  return msg.length > max ? `${msg.slice(0, max)}…` : msg;
}
