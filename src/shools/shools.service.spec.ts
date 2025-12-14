import { Test, TestingModule } from '@nestjs/testing';
import { ShoolsService } from './shools.service';

describe('ShoolsService', () => {
  let service: ShoolsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShoolsService],
    }).compile();

    service = module.get<ShoolsService>(ShoolsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
