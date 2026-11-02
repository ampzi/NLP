import { PartialType } from '@nestjs/mapped-types';
import { CreateMonitorDto } from '../dto/create-monitor.dto.js';

export class UpdateMonitorDto extends PartialType(CreateMonitorDto) {}
