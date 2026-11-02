import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { IncidentsService } from './incidents.service.js';

@Controller('incidents')
export class IncidentsController {
  constructor(private readonly incidents: IncidentsService) {}

  @Get()
  list(
    @CurrentUser('id') userId: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('offset', new ParseIntPipe({ optional: true })) offset?: number,
  ) {
    return this.incidents.list(userId, limit ?? 50, offset ?? 0);
  }
}
