import { Module } from '@nestjs/common';
import { MonitoringModule } from '../monitoring/monitoring.module.js';
import { MonitorsController } from './monitors.controller.js';
import { MonitorsService } from './monitors.service.js';

@Module({
  imports: [MonitoringModule],
  controllers: [MonitorsController],
  providers: [MonitorsService],
  exports: [MonitorsService],
})
export class MonitorsModule {}
