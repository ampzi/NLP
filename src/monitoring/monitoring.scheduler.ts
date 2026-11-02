import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service.js';
import { CheckerService } from './checker.service.js';

// Scan frequency. Each monitor still runs on its own checkIntervalSeconds —
// this only decides how often we look for monitors that are due.
const TICK_MS = 60_000;
const CONCURRENCY = 5;

@Injectable()
export class MonitoringScheduler {
  private readonly logger = new Logger(MonitoringScheduler.name);
  private running = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly checker: CheckerService,
  ) {}

  @Interval('monitor-tick', TICK_MS)
  async tick(): Promise<void> {
    if (this.running) return; // prevent overlapping scans
    this.running = true;
    try {
      const due = await this.findDueMonitors();
      if (due.length === 0) return;
      this.logger.log(`Dispatching ${due.length} due check(s)`);
      await runWithConcurrency(due, CONCURRENCY, async (monitor) => {
        try {
          await this.checker.checkMonitorById(monitor.id);
        } catch (error) {
          this.logger.error(`Check failed for monitor ${monitor.id}`, error as Error);
        }
      });
    } finally {
      this.running = false;
    }
  }

  private async findDueMonitors() {
    const monitors = await this.prisma.monitor.findMany({
      where: { isActive: true },
      select: { id: true, lastCheckedAt: true, checkIntervalSeconds: true },
    });
    const now = Date.now();
    return monitors.filter((m) => {
      if (!m.lastCheckedAt) return true; // never checked yet
      return now - m.lastCheckedAt.getTime() >= m.checkIntervalSeconds * 1000;
    });
  }
}

async function runWithConcurrency<T>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<unknown>,
): Promise<void> {
  const queue = [...items];
  const workerCount = Math.min(Math.max(1, limit), queue.length);
  const workers = Array.from({ length: workerCount }, async () => {
    while (queue.length > 0) {
      const item = queue.shift()!;
      await fn(item);
    }
  });
  await Promise.all(workers);
}
