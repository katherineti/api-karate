import { Test, TestingModule } from '@nestjs/testing';
import { PuntuationService } from './puntuation.service';

describe('PuntuationService', () => {
  let service: PuntuationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PuntuationService],
    }).compile();

    service = module.get<PuntuationService>(PuntuationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
