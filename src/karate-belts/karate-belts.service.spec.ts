import { Test, TestingModule } from '@nestjs/testing';
import { KarateBeltsService } from './karate-belts.service';

describe('KarateBeltsService', () => {
  let service: KarateBeltsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KarateBeltsService],
    }).compile();

    service = module.get<KarateBeltsService>(KarateBeltsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
