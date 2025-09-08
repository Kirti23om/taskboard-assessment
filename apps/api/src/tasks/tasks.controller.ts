import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request, UseInterceptors, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ThrottlerInterceptor } from '@nestjs/throttler';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskQueryDto } from './dto/task-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseInterceptors(ThrottlerInterceptor)
@Controller()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('projects/:projectId/tasks')
  @ApiOperation({ summary: 'Get tasks for a project' })
  @ApiQuery({ name: 'status', required: false, enum: ['todo', 'in_progress', 'done'] })
  @ApiQuery({ name: 'priority', required: false, enum: ['low', 'med', 'high'] })
  @ApiQuery({ name: 'assigneeEmail', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'size', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'] })
  @ApiResponse({ status: 200, description: 'Tasks retrieved successfully' })
  async findByProject(
    @Param('projectId') projectId: string,
    @Query() query: TaskQueryDto,
    @Headers() headers: any,
  ) {
    // DEFECT 8: Rate-limit header bug - X-RateLimit-Remaining doesn't decrement
    const result = await this.tasksService.findByProject(projectId, query);
    
    // Simulate rate limit headers but with bug
    headers['X-RateLimit-Limit'] = '60';
    headers['X-RateLimit-Remaining'] = '60'; // Should decrement but stays at 60
    
    return result;
  }

  @Post('projects/:projectId/tasks')
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ status: 201, description: 'Task created successfully' })
  create(
    @Param('projectId') projectId: string,
    @Body() createTaskDto: CreateTaskDto,
    @Request() req: any,
  ) {
    return this.tasksService.create(projectId, createTaskDto, req.user.id);
  }

  @Patch('tasks/:id')
  @ApiOperation({ summary: 'Update a task' })
  @ApiResponse({ status: 200, description: 'Task updated successfully' })
  update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Request() req: any,
  ) {
    return this.tasksService.update(id, updateTaskDto, req.user.id);
  }

  @Delete('tasks/:id')
  @ApiOperation({ summary: 'Delete a task' })
  @ApiResponse({ status: 200, description: 'Task deleted successfully' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.tasksService.remove(id, req.user.id);
  }
}
