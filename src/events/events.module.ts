import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { DrizzleDbConecctionModule } from '../db/db.module';

@Module({
  imports: [DrizzleDbConecctionModule],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}