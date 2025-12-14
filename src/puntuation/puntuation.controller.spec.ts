import { Test, TestingModule } from '@nestjs/testing';
import { PuntuationController } from './puntuation.controller';

describe('PuntuationController', () => {
  let controller: PuntuationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PuntuationController],
    }).compile();

    controller = module.get<PuntuationController>(PuntuationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
