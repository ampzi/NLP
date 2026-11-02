import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateNotificationSettingsDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  telegramChatId?: string;

  @IsOptional()
  @IsBoolean()
  telegramEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  notifyOnDown?: boolean;

  @IsOptional()
  @IsBoolean()
  notifyOnRecovery?: boolean;
}
