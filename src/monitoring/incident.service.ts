import { Injectable } from '@nestjs/common';
import { Incident } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class IncidentService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Called after a failed check. Opens an incident once the failure
   * threshold is reached, but only if one is not already OPEN for the
   * monitor (rule B: at most one open incident per monitor).
   *
   * Returns the newly created incident, or null when the threshold has not
   * been met yet or an incident is already open — so callers never send a
   * repeated "down" notification for the same outage.
   */
  async onFailure(
    monitorId: number,
    consecutiveFailures: number,
    threshold: number,
    cause?: string | null,
    message?: string | null,
  ): Promise<Incident | null> {
    if (consecutiveFailures < threshold) return null;

    const open = await this.prisma.incident.findFirst({
      where: { monitorId, status: 'OPEN' },
    });
    if (open) return null;

    return this.prisma.incident.create({
      data: {
        monitorId,
        startedAt: new Date(),
        status: 'OPEN',
        cause,
        failureMessage: message,
      },
    });
  }

  /**
   * Called after a successful check. Resolves the open incident (if any) and
   * returns it, or null when there was nothing open to resolve.
   */
  async onRecovery(monitorId: number): Promise<Incident | null> {
    const open = await this.prisma.incident.findFirst({
      where: { monitorId, status: 'OPEN' },
    });
    if (!open) return null;

    return this.prisma.incident.update({
      where: { id: open.id },
      data: { status: 'RESOLVED', resolvedAt: new Date() },
    });
  }
}
