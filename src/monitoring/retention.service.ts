import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service.js';

const DAY_MS = 86_400_000;

/**
 * Rule D: "Keep history growth in mind." CheckResult grows quickly, so we
 * periodically purge old rows. Resolved incidents are also cleaned up.
 *
 * Configure with:
 *   CHECK_RESULT_RETENTION_DAYS  (default 90,  0 = never delete)
 *   INCIDENT_RETENTION_DAYS      (default 365, 0 = never delete)
 */
@Injectable()
export class RetentionService {
  private readonly logger = new Logger(RetentionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanup(): Promise<void> {
    const checkDays = this.days('CHECK_RESULT_RETENTION_DAYS', 90);
    const incidentDays = this.days('INCIDENT_RETENTION_DAYS', 365);

    let checks = 0;
    let incidents = 0;

    if (checkDays > 0) {
      const cutoff = new Date(Date.now() - checkDays * DAY_MS);
      const result = await this.prisma.checkResult.deleteMany({
        where: { checkedAt: { lt: cutoff } },
      });
      checks = result.count;
    }

    if (incidentDays > 0) {
      const cutoff = new Date(Date.now() - incidentDays * DAY_MS);
      const result = await this.prisma.incident.deleteMany({
        where: { status: 'RESOLVED', resolvedAt: { lt: cutoff } },
      });
      incidents = result.count;
    }

    if (checks > 0 || incidents > 0) {
      this.logger.log(
        `Retention cleanup: removed ${checks} check result(s), ${incidents} incident(s)`,
      );
    }
  }

  private days(key: string, fallback: number): number {
    const n = Number(this.config.get<string>(key, String(fallback)));
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  }
}
