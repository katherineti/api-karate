import { Test, TestingModule } from '@nestjs/testing';
import { EventConfigService } from './event-config.service';

describe('EventConfigService', () => {
  let service: EventConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventConfigService],
    }).compile();

    service = module.get<EventConfigService>(EventConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
