import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Incident, Monitor } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class NotifierService {
  private readonly logger = new Logger(NotifierService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async notifyDown(monitor: Monitor, incident: Incident): Promise<void> {
    const reason = incident.failureMessage
      ? `\nReason: ${incident.failureMessage}`
      : '';
    await this.notify(monitor, 'down', `🔴 ${monitor.name} is DOWN\n${monitor.url}${reason}`);
  }

  async notifyRecovery(monitor: Monitor, incident: Incident): Promise<void> {
    const duration = incident.resolvedAt
      ? ` (down ${formatDuration(incident.startedAt, incident.resolvedAt)})`
      : '';
    await this.notify(
      monitor,
      'recovery',
      `🟢 ${monitor.name} recovered${duration}\n${monitor.url}`,
    );
  }

  private async notify(
    monitor: Monitor,
    kind: 'down' | 'recovery',
    text: string,
  ): Promise<void> {
    const settings = await this.prisma.notificationSetting.findUnique({
      where: { userId: monitor.userId },
    });
    if (!settings || !settings.telegramEnabled || !settings.telegramChatId) {
      return;
    }
    if (kind === 'down' && !settings.notifyOnDown) return;
    if (kind === 'recovery' && !settings.notifyOnRecovery) return;

    const token = this.config.get<string>('TELEGRAM_BOT_TOKEN');
    if (!token) {
      this.logger.warn(
        `Telegram is enabled for user ${monitor.userId} but TELEGRAM_BOT_TOKEN is not set — skipping`,
      );
      return;
    }

    try {
      const res = await fetch(
        `https://api.telegram.org/bot${token}/sendMessage`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ chat_id: settings.telegramChatId, text }),
        },
      );
      if (!res.ok) {
        this.logger.error(`Telegram sendMessage failed (HTTP ${res.status})`);
      }
    } catch (error) {
      this.logger.error('Telegram sendMessage threw', error as Error);
    }
  }
}

function formatDuration(start: Date, end: Date): string {
  const seconds = Math.max(
    0,
    Math.round((end.getTime() - start.getTime()) / 1000),
  );
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m < 60) return s ? `${m}m ${s}s` : `${m}m`;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${h}h ${mm}m`;
}
