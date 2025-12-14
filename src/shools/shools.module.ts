import { Module } from '@nestjs/common';
import { ShoolsController } from './shools.controller';
import { ShoolsService } from './shools.service';
import { DrizzleDbConecctionModule } from '../db/db.module';

@Module({
  imports: [DrizzleDbConecctionModule],
  controllers: [ShoolsController],
  providers: [ShoolsService],
  exports:[ShoolsService]
})
export class ShoolsModule {}