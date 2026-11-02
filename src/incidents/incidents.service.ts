import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { flattenIncident } from '../common/incident-mapper.js';

@Injectable()
export class IncidentsService {
  constructor(private readonly prisma: PrismaService) {}

  /** All incidents across every monitor the user owns, newest first. */
  async list(userId: number, limit = 50, offset = 0) {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.incident.findMany({
        where: { monitor: { userId } },
        include: { monitor: { select: { name: true } } },
        orderBy: { startedAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      this.prisma.incident.count({ where: { monitor: { userId } } }),
    ]);
    return { items: items.map(flattenIncident), total, limit, offset };
  }
}
