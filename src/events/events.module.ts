import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { DrizzleDbConecctionModule } from '../db/db.module';
import { ParticipantRequestsService } from './participantRequests/participantRequests.service';
import { ParticipantRequestsController } from './participantRequests/participantRequests.controller';

@Module({
  imports: [DrizzleDbConecctionModule],
  controllers: [EventsController, ParticipantRequestsController],
  providers: [EventsService, ParticipantRequestsService],
})
export class EventsModule {}