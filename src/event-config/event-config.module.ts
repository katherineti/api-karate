import { Module } from '@nestjs/common';
import { EventConfigService } from './event-config.service';
import { EventConfigController } from './event-config.controller';
import { DrizzleDbConecctionModule } from '../db/db.module';

@Module({
  imports: [DrizzleDbConecctionModule],
  controllers: [EventConfigController],
  providers: [EventConfigService],
  exports: [EventConfigService],
})
export class EventConfigModule {}
