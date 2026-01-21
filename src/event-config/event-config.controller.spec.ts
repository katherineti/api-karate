import { Test, TestingModule } from '@nestjs/testing';
import { EventConfigController } from './event-config.controller';
import { EventConfigService } from './event-config.service';

describe('EventConfigController', () => {
  let controller: EventConfigController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventConfigController],
      providers: [EventConfigService],
    }).compile();

    controller = module.get<EventConfigController>(EventConfigController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
