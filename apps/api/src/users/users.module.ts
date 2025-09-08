import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { DataService } from '../data/data.service';

@Module({
  providers: [UsersService, DataService],
  exports: [UsersService],
})
export class UsersModule {}
