import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ActivityService {
  constructor(private prisma: PrismaService) {}

  async log(taskId: string, type: string, userId: string) {
    return this.prisma.activityLog.create({
      data: {
        taskId,
        type,
        by: userId,
      },
    });
  }

  async findByTask(taskId: string) {
    return this.prisma.activityLog.findMany({
      where: { taskId },
      orderBy: { ts: 'desc' },
    });
  }
}
