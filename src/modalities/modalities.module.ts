import { Module } from '@nestjs/common';
import { ModalitiesService } from './modalities.service';
import { ModalitiesController } from './modalities.controller';
import { DrizzleDbConecctionModule } from '../db/db.module';

@Module({
  imports: [DrizzleDbConecctionModule],
  controllers: [ModalitiesController],
  providers: [ModalitiesService],
  exports: [ModalitiesService],
})
export class ModalitiesModule {}