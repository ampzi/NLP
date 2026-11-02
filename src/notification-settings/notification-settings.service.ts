import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { UpdateNotificationSettingsDto } from './dto/update-notification-settings.dto.js';

const DEFAULT_SETTINGS = {
  telegramChatId: null,
  telegramEnabled: false,
  notifyOnDown: true,
  notifyOnRecovery: true,
};

@Injectable()
export class NotificationSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Always returns a row, creating the default one on first access. */
  async getForUser(userId: number) {
    const existing = await this.prisma.notificationSetting.findUnique({
      where: { userId },
    });
    if (existing) return existing;

    return this.prisma.notificationSetting.create({
      data: { userId, ...DEFAULT_SETTINGS },
    });
  }

  /** Create or replace the current user's settings. */
  async upsert(userId: number, dto: UpdateNotificationSettingsDto) {
    return this.prisma.notificationSetting.upsert({
      where: { userId },
      create: { userId, ...DEFAULT_SETTINGS, ...dto },
      update: dto,
    });
  }
}
