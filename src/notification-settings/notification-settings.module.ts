import { Module } from '@nestjs/common';
import { NotificationSettingsController } from './notification-settings.controller.js';
import { NotificationSettingsService } from './notification-settings.service.js';

@Module({
  controllers: [NotificationSettingsController],
  providers: [NotificationSettingsService],
  exports: [NotificationSettingsService],
})
export class NotificationSettingsModule {}
