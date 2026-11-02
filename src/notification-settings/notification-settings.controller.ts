import { Body, Controller, Get, Put } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { NotificationSettingsService } from './notification-settings.service.js';
import { UpdateNotificationSettingsDto } from './dto/update-notification-settings.dto.js';

@Controller('notification-settings')
export class NotificationSettingsController {
  constructor(private readonly settings: NotificationSettingsService) {}

  @Get()
  get(@CurrentUser('id') userId: number) {
    return this.settings.getForUser(userId);
  }

  @Put()
  update(
    @CurrentUser('id') userId: number,
    @Body() dto: UpdateNotificationSettingsDto,
  ) {
    return this.settings.upsert(userId, dto);
  }
}
