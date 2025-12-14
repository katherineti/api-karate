import { Test, TestingModule } from '@nestjs/testing';
import { ShoolsController } from './shools.controller';

describe('ShoolsController', () => {
  let controller: ShoolsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShoolsController],
    }).compile();

    controller = module.get<ShoolsController>(ShoolsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
