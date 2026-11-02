import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js'; // ← adjust to your existing guard
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { MonitorsService, TimeRange } from './monitors.service.js';
import { CreateMonitorDto } from './dto/create-monitor.dto.js';
import { UpdateMonitorDto } from './dto/update-monitor.dto.js';
import { ListMonitorsDto } from './dto/list-monitors.dto.js';

@UseGuards(JwtAuthGuard)
@Controller('monitors')
export class MonitorsController {
  constructor(private readonly monitors: MonitorsService) {}

  @Post()
  create(@CurrentUser('id') userId: number, @Body() dto: CreateMonitorDto) {
    return this.monitors.create(userId, dto);
  }

  @Get()
  list(@CurrentUser('id') userId: number, @Query() q: ListMonitorsDto) {
    return this.monitors.list(userId, q);
  }

  // Aggregate routes must be declared before `:id` so `/monitors/stats`
  // is not captured by the `:id` parameter.
  @Get('stats')
  stats(
    @CurrentUser('id') userId: number,
    @Query('days') days?: string,
  ) {
    return this.monitors.stats(userId, days ? Number(days) : 30);
  }

  @Get('response-times')
  aggregateSeries(
    @CurrentUser('id') userId: number,
    @Query('range') range?: string,
  ) {
    return this.monitors.aggregateResponseTimeSeries(
      userId,
      (range as TimeRange) ?? '24h',
    );
  }

  @Get(':id')
  get(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.monitors.getOwned(userId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMonitorDto,
  ) {
    return this.monitors.update(userId, id, dto);
  }

  @Delete(':id')
  remove(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.monitors.remove(userId, id);
  }

  @Post(':id/check')
  runCheck(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.monitors.runCheck(userId, id);
  }

  @Get(':id/response-times')
  series(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Query('range') range?: string,
  ) {
    return this.monitors.responseTimeSeries(
      userId,
      id,
      (range as TimeRange) ?? '24h',
    );
  }

  @Get(':id/checks')
  listChecks(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.monitors.listChecks(
      userId,
      id,
      limit ? Number(limit) : 50,
      offset ? Number(offset) : 0,
    );
  }

  @Get(':id/checks/:checkId')
  getCheck(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Param('checkId', ParseIntPipe) checkId: number,
  ) {
    return this.monitors.getCheck(userId, id, checkId);
  }

  @Get(':id/incidents')
  listIncidents(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.monitors.listIncidents(
      userId,
      id,
      limit ? Number(limit) : 20,
      offset ? Number(offset) : 0,
    );
  }

  @Get(':id/incidents/:incidentId')
  getIncident(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Param('incidentId', ParseIntPipe) incidentId: number,
  ) {
    return this.monitors.getIncident(userId, id, incidentId);
  }
}
