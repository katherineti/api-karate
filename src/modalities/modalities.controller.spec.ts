import { Test, TestingModule } from '@nestjs/testing';
import { ModalitiesController } from './modalities.controller';
import { ModalitiesService } from './modalities.service';

describe('ModalitiesController', () => {
  let controller: ModalitiesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ModalitiesController],
      providers: [ModalitiesService],
    }).compile();

    controller = module.get<ModalitiesController>(ModalitiesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
