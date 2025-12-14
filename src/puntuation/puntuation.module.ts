import { Module } from '@nestjs/common';
import { PuntuationController } from './puntuation.controller';
import { PuntuationService } from './puntuation.service';
import { DrizzleDbConecctionModule } from '../db/db.module';
import { ShoolsModule } from '../shools/shools.module';

@Module({
  imports: [DrizzleDbConecctionModule, ShoolsModule],
  controllers: [PuntuationController],
  providers: [PuntuationService],
  exports: [PuntuationService],
})
export class PuntuationModule {}
