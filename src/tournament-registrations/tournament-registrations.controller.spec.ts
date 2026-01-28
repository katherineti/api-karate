import { Test, TestingModule } from '@nestjs/testing';
import { TournamentRegistrationsController } from './tournament-registrations.controller';
import { TournamentRegistrationsService } from './tournament-registrations.service';

describe('TournamentRegistrationsController', () => {
  let controller: TournamentRegistrationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TournamentRegistrationsController],
      providers: [TournamentRegistrationsService],
    }).compile();

    controller = module.get<TournamentRegistrationsController>(TournamentRegistrationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
