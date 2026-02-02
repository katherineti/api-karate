import { Module } from '@nestjs/common';
import { KarateBeltsService } from './karate-belts.service';
import { KarateBeltsController } from './karate-belts.controller';
import { DrizzleDbConecctionModule } from '../db/db.module';

@Module({
  imports: [DrizzleDbConecctionModule],
  controllers: [KarateBeltsController],
  providers: [KarateBeltsService],
})
export class KarateBeltsModule {}