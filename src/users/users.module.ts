import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { DrizzleDbConecctionModule } from 'src/db/db.module';
import { UsersController } from './users.controller';

@Module({
  imports: [DrizzleDbConecctionModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {}