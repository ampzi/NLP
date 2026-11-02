import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CheckerService } from '../monitoring/checker.service.js';
import { flattenIncident } from '../common/incident-mapper.js';
import { CreateMonitorDto } from './dto/create-monitor.dto.js';
import { UpdateMonitorDto } from './dto/update-monitor.dto.js';
import { ListMonitorsDto } from './dto/list-monitors.dto.js';

@Injectable()
export class MonitorsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly checker: CheckerService,
  ) {}

  private get maxMonitorsPerUser(): number {
    const n = Number(process.env.MAX_MONITORS_PER_USER ?? 100);
    return Number.isFinite(n) && n > 0 ? n : 100;
  }

  // ─── create ────────────────────────────────────────────────
  async create(userId: number, dto: CreateMonitorDto) {
    // Rule E: cap how many monitors a single user can own.
    const count = await this.prisma.monitor.count({ where: { userId } });
    if (count >= this.maxMonitorsPerUser) {
      throw new ForbiddenException(
        `Monitor limit reached (${this.maxMonitorsPerUser} per user)`,
      );
    }

    return this.prisma.monitor.create({
      data: {
        userId,
        name: dto.name,
        url: dto.url,
        description: dto.description,
        checkIntervalSeconds: dto.checkIntervalSeconds ?? 300,
        timeoutMs: dto.timeoutMs ?? 10_000,
        isActive: dto.isActive ?? true,
        currentStatus: 'PENDING',
        consecutiveFailures: 0,
      },
    });
  }

  // ─── list with pagination / search / filter / sort ─────────
  async list(userId: number, q: ListMonitorsDto) {
    const where: Prisma.MonitorWhereInput = {
      userId,
      ...(q.active !== undefined ? { isActive: q.active === 'true' } : {}),
      ...(q.search
        ? {
            OR: [
              { name: { contains: q.search, mode: 'insensitive' } },
              { url: { contains: q.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.monitor.findMany({
        where,
        orderBy: {
          [q.sortBy]: q.sortDir,
        } as Prisma.MonitorOrderByWithRelationInput,
        skip: q.offset,
        take: q.limit,
      }),
      this.prisma.monitor.count({ where }),
    ]);

    return { items, total, limit: q.limit, offset: q.offset };
  }

  // ─── ownership guard — used by every write / read-single ───
  async getOwned(userId: number, id: number) {
    const monitor = await this.prisma.monitor.findUnique({ where: { id } });
    if (!monitor) throw new NotFoundException(`Monitor ${id} not found`);
    if (monitor.userId !== userId) {
      throw new ForbiddenException('You do not own this monitor');
    }
    return monitor;
  }

  // ─── update ────────────────────────────────────────────────
  async update(userId: number, id: number, dto: UpdateMonitorDto) {
    const current = await this.getOwned(userId, id);

    // If the URL changes, cached status is meaningless — reset it.
    const urlChanged = dto.url !== undefined && dto.url !== current.url;
    const reset: Prisma.MonitorUpdateInput = urlChanged
      ? {
          currentStatus: 'PENDING',
          consecutiveFailures: 0,
          lastCheckedAt: null,
          lastResponseTimeMs: null,
        }
      : {};

    return this.prisma.monitor.update({
      where: { id },
      data: { ...dto, ...reset },
    });
  }

  // ─── delete ────────────────────────────────────────────────
  async remove(userId: number, id: number) {
    await this.getOwned(userId, id);
    await this.prisma.monitor.delete({ where: { id } });
    return { ok: true, id };
  }

  // ─── run a check now (manual trigger) ──────────────────────
  async runCheck(userId: number, id: number) {
    const monitor = await this.getOwned(userId, id);
    return this.checker.checkMonitor(monitor);
  }

  // ─── history: single check / incident ──────────────────────
  async getCheck(userId: number, monitorId: number, checkId: number) {
    await this.getOwned(userId, monitorId);
    const check = await this.prisma.checkResult.findFirst({
      where: { id: checkId, monitorId },
    });
    if (!check) throw new NotFoundException(`CheckResult ${checkId} not found`);
    return check;
  }

  async getIncident(userId: number, monitorId: number, incidentId: number) {
    await this.getOwned(userId, monitorId);
    const incident = await this.prisma.incident.findFirst({
      where: { id: incidentId, monitorId },
      include: { monitor: { select: { name: true } } },
    });
    if (!incident) {
      throw new NotFoundException(`Incident ${incidentId} not found`);
    }
    return flattenIncident(incident);
  }

  // ─── history: checks ───────────────────────────────────────
  async listChecks(userId: number, id: number, limit = 50, offset = 0) {
    await this.getOwned(userId, id);
    const [items, total] = await this.prisma.$transaction([
      this.prisma.checkResult.findMany({
        where: { monitorId: id },
        orderBy: { checkedAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      this.prisma.checkResult.count({ where: { monitorId: id } }),
    ]);
    return { items, total, limit, offset };
  }

  // ─── history: incidents ────────────────────────────────────
  async listIncidents(userId: number, id: number, limit = 20, offset = 0) {
    await this.getOwned(userId, id);
    const [items, total] = await this.prisma.$transaction([
      this.prisma.incident.findMany({
        where: { monitorId: id },
        include: { monitor: { select: { name: true } } },
        orderBy: { startedAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      this.prisma.incident.count({ where: { monitorId: id } }),
    ]);
    return { items: items.map(flattenIncident), total, limit, offset };
  }

  // ─── stats: uptime / last success / avg response ───────────
  async stats(userId: number, days = 30) {
    const monitors = await this.prisma.monitor.findMany({
      where: { userId },
      select: { id: true, lastResponseTimeMs: true },
    });
    const ids = monitors.map((m) => m.id);
    if (ids.length === 0) return { items: [] };

    const cutoff = new Date(Date.now() - days * 86_400_000);
    const [totals, successes, lastSuccesses] = await this.prisma.$transaction([
      this.prisma.checkResult.groupBy({
        by: ['monitorId'],
        where: { monitorId: { in: ids }, checkedAt: { gte: cutoff } },
        _count: { _all: true },
      }),
      this.prisma.checkResult.groupBy({
        by: ['monitorId'],
        where: {
          monitorId: { in: ids },
          status: 'SUCCESS',
          checkedAt: { gte: cutoff },
        },
        _count: { _all: true },
      }),
      this.prisma.checkResult.groupBy({
        by: ['monitorId'],
        where: { monitorId: { in: ids }, status: 'SUCCESS' },
        _max: { checkedAt: true },
      }),
    ]);

    const totalMap = new Map(totals.map((t) => [t.monitorId, t._count._all]));
    const successMap = new Map(
      successes.map((s) => [s.monitorId, s._count._all]),
    );
    const lastSuccessMap = new Map(
      lastSuccesses.map((s) => [s.monitorId, s._max.checkedAt]),
    );

    return {
      days,
      items: monitors.map((m) => {
        const total = totalMap.get(m.id) ?? 0;
        const success = successMap.get(m.id) ?? 0;
        return {
          monitorId: m.id,
          totalChecks: total,
          successChecks: success,
          uptimePercentage:
            total > 0 ? Number(((success / total) * 100).toFixed(2)) : 0,
          averageResponseTimeMs: m.lastResponseTimeMs,
          lastSuccessAt: lastSuccessMap.get(m.id) ?? null,
        };
      }),
    };
  }

  // ─── response-time series (single + aggregate) ─────────────
  async responseTimeSeries(
    userId: number,
    id: number,
    range: TimeRange = '24h',
  ) {
    await this.getOwned(userId, id);
    const checks = await this.prisma.checkResult.findMany({
      where: { monitorId: id, checkedAt: { gte: rangeStart(range) } },
      orderBy: { checkedAt: 'asc' },
      select: { checkedAt: true, responseTimeMs: true },
    });
    return bucketize(checks, range);
  }

  async aggregateResponseTimeSeries(userId: number, range: TimeRange = '24h') {
    const checks = await this.prisma.checkResult.findMany({
      where: { monitor: { userId }, checkedAt: { gte: rangeStart(range) } },
      orderBy: { checkedAt: 'asc' },
      select: { checkedAt: true, responseTimeMs: true },
    });
    return bucketize(checks, range);
  }
}

export type TimeRange = '24h' | '7d' | '30d';

const HOUR_MS = 3_600_000;
const DAY_MS = 86_400_000;

function rangeStart(range: TimeRange): Date {
  const ms = range === '24h' ? DAY_MS : range === '7d' ? 7 * DAY_MS : 30 * DAY_MS;
  return new Date(Date.now() - ms);
}

function bucketize(
  checks: { checkedAt: Date; responseTimeMs: number | null }[],
  range: TimeRange,
) {
  const bucketMs = range === '30d' ? DAY_MS : HOUR_MS;
  const buckets = new Map<number, number[]>();
  for (const c of checks) {
    if (c.responseTimeMs == null) continue;
    const key = Math.floor(c.checkedAt.getTime() / bucketMs) * bucketMs;
    const arr = buckets.get(key);
    if (arr) arr.push(c.responseTimeMs);
    else buckets.set(key, [c.responseTimeMs]);
  }
  return [...buckets.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([ts, values]) => ({
      timestamp: new Date(ts).toISOString(),
      responseTimeMs: Math.round(
        values.reduce((sum, v) => sum + v, 0) / values.length,
      ),
    }));
}
