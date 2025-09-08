import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ActivityService } from './activity.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('activity')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get(':taskId/activity')
  @ApiOperation({ summary: 'Get activity log for a task' })
  @ApiResponse({ status: 200, description: 'Activity log retrieved successfully' })
  findByTask(@Param('taskId') taskId: string) {
    return this.activityService.findByTask(taskId);
  }
}
