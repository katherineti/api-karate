import { Module } from '@nestjs/common';
import { TournamentRegistrationsService } from './tournament-registrations.service';
import { TournamentRegistrationsController } from './tournament-registrations.controller';
import { DrizzleDbConecctionModule } from '../db/db.module';

@Module({
  imports: [DrizzleDbConecctionModule],
  controllers: [TournamentRegistrationsController],
  providers: [TournamentRegistrationsService],
})
export class TournamentRegistrationsModule {}
