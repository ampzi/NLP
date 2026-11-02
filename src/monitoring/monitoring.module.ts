import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CheckerService } from './checker.service.js';
import { IncidentService } from './incident.service.js';
import { NotifierService } from './notifier.service.js';
import { MonitoringScheduler } from './monitoring.scheduler.js';
import { RetentionService } from './retention.service.js';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [
    CheckerService,
    IncidentService,
    NotifierService,
    MonitoringScheduler,
    RetentionService,
  ],
  exports: [CheckerService],
})
export class MonitoringModule {}
