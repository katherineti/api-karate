import { Test, TestingModule } from '@nestjs/testing';
import { KarateBeltsController } from './karate-belts.controller';
import { KarateBeltsService } from './karate-belts.service';

describe('KarateBeltsController', () => {
  let controller: KarateBeltsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KarateBeltsController],
      providers: [KarateBeltsService],
    }).compile();

    controller = module.get<KarateBeltsController>(KarateBeltsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
