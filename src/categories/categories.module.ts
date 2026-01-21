import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { DrizzleDbConecctionModule } from '../db/db.module';

@Module({
  imports: [DrizzleDbConecctionModule],
  controllers: [CategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule {}