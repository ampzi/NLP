import { Test, TestingModule } from '@nestjs/testing';
import { MonitorsService } from './monitors.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CheckerService } from '../monitoring/checker.service.js';

describe('MonitorsService', () => {
  let service: MonitorsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MonitorsService,
        { provide: PrismaService, useValue: {} },
        { provide: CheckerService, useValue: {} },
      ],
    }).compile();

    service = module.get<MonitorsService>(MonitorsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
