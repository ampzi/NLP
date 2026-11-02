import { Test, TestingModule } from '@nestjs/testing';
import { MonitorsController } from './monitors.controller.js';
import { MonitorsService } from './monitors.service.js';

describe('MonitorsController', () => {
  let controller: MonitorsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MonitorsController],
      providers: [{ provide: MonitorsService, useValue: {} }],
    }).compile();

    controller = module.get<MonitorsController>(MonitorsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
