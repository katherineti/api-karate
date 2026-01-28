import { Test, TestingModule } from '@nestjs/testing';
import { TournamentRegistrationsService } from './tournament-registrations.service';

describe('TournamentRegistrationsService', () => {
  let service: TournamentRegistrationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TournamentRegistrationsService],
    }).compile();

    service = module.get<TournamentRegistrationsService>(TournamentRegistrationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
