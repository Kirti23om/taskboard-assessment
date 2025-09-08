import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { DataService } from '../data/data.service';

@Module({
  providers: [ProjectsService, DataService],
  controllers: [ProjectsController],
  exports: [ProjectsService],
})
export class ProjectsModule {}
