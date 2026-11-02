import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { IsSafeUrl } from '../../common/validators/is-safe-url.validator.js';

export class CreateMonitorDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name!: string;

  @IsString()
  @IsSafeUrl()
  url!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(60) // 1 minute minimum
  @Max(86_400) // 24 hours maximum
  checkIntervalSeconds?: number;

  @IsOptional()
  @IsInt()
  @Min(1_000)
  @Max(60_000)
  timeoutMs?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
