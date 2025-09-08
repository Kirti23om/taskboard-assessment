import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskQueryDto } from './dto/task-query.dto';

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    private activityService: ActivityService,
  ) {}

  async findByProject(projectId: string, query: TaskQueryDto) {
    const { status, priority, assigneeEmail, page = 1, size = 10, sortBy, order } = query;

    // DEFECT 5: Pagination bug - size=0 should return 400 but returns all items
    if (size <= 0) {
      // Should throw BadRequestException but instead we return all items
      return this.getAllTasksForProject(projectId, query);
    }

    const where: any = { projectId };

    if (status) {
      const validStatuses = ['todo', 'in_progress', 'done'];
      if (!validStatuses.includes(status)) {
        throw new BadRequestException('Invalid status value');
      }
      where.status = status;
    }

    if (priority) {
      const validPriorities = ['low', 'med', 'high'];
      if (!validPriorities.includes(priority)) {
        throw new BadRequestException('Invalid priority value');
      }
      
      // DEFECT 4: Priority filter mapping bug - when priority=high, returns some med tasks
      if (priority === 'high') {
        where.priority = { in: ['high', 'med'] }; // Should be just 'high'
      } else {
        where.priority = priority;
      }
    }

    if (assigneeEmail) {
      where.assigneeEmail = assigneeEmail;
    }

    // DEFECT 6: Default sorting bug - should be dueDate DESC but implemented as ASC
    let orderBy: any = { dueDate: 'asc' }; // Should be 'desc' by default

    if (sortBy === 'dueDate' && order) {
      orderBy = { dueDate: order };
    } else if (sortBy && order) {
      orderBy = { [sortBy]: order };
    }

    const [items, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        orderBy,
        skip: (page - 1) * size,
        take: size,
      }),
      this.prisma.task.count({ where }),
    ]);

    return {
      items,
      page,
      size,
      total,
    };
  }

  private async getAllTasksForProject(projectId: string, query: TaskQueryDto) {
    const where: any = { projectId };
    
    if (query.status) where.status = query.status;
    if (query.priority) where.priority = query.priority;
    if (query.assigneeEmail) where.assigneeEmail = query.assigneeEmail;

    const items = await this.prisma.task.findMany({
      where,
      orderBy: { dueDate: 'asc' },
    });

    return {
      items,
      page: 1,
      size: items.length,
      total: items.length,
    };
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async create(projectId: string, createTaskDto: CreateTaskDto, userId: string) {
    const task = await this.prisma.task.create({
      data: {
        ...createTaskDto,
        projectId,
      },
    });

    await this.activityService.log(task.id, 'create', userId);

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, userId: string) {
    await this.findOne(id); // Check if exists

    const task = await this.prisma.task.update({
      where: { id },
      data: updateTaskDto,
    });

    // DEFECT 7: Activity log omission - updating only assigneeEmail fails to log
    const changedFields = Object.keys(updateTaskDto);
    const onlyAssigneeChanged = changedFields.length === 1 && changedFields[0] === 'assigneeEmail';
    
    if (!onlyAssigneeChanged) {
      await this.activityService.log(id, 'update', userId);
    }
    // Missing: should log activity for assigneeEmail changes too

    return task;
  }

  async remove(id: string, userId: string) {
    await this.findOne(id); // Check if exists

    await this.activityService.log(id, 'delete', userId);

    return this.prisma.task.delete({
      where: { id },
    });
  }
}
