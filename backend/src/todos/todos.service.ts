import { Injectable, NotFoundException, ForbiddenException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { BulkCreateTodoDto } from './dto/bulk-create-todo.dto';
import { BulkDeleteTodoDto } from './dto/bulk-delete-todo.dto';
import * as sanitizeHtml from 'sanitize-html';

@Injectable()
export class TodosService {
  constructor(private prisma: PrismaService) {}

  async create(createTodoDto: CreateTodoDto, userId: string) {
    const { title, description } = createTodoDto;

    // Validate title is not empty
    if (!title || title.trim().length === 0) {
      throw new BadRequestException('Title cannot be empty');
    }

    // Sanitize description if provided
    const sanitizedDescription = description 
      ? sanitizeHtml(description, { allowedTags: [], allowedAttributes: {} })
      : null;

    return this.prisma.todo.create({
      data: {
        title: title.trim(),
        description: sanitizedDescription,
        ownerId: userId,
      },
    });
  }

  async findAll(userId: string, filter?: 'all' | 'completed' | 'pending') {
    const where: any = { ownerId: userId };

    if (filter === 'completed') {
      where.completed = true;
    } else if (filter === 'pending') {
      where.completed = false;
    }

    return this.prisma.todo.findMany({
      where,
      orderBy: { lastModified: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const todo = await this.prisma.todo.findUnique({
      where: { id },
    });

    if (!todo) {
      throw new NotFoundException('Todo not found');
    }

    if (todo.ownerId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return todo;
  }

  async update(id: string, updateTodoDto: UpdateTodoDto, userId: string) {
    const { version, ...updateData } = updateTodoDto;

    // Validate title if provided
    if (updateData.title !== undefined) {
      if (!updateData.title || updateData.title.trim().length === 0) {
        throw new BadRequestException('Title cannot be empty');
      }
      updateData.title = updateData.title.trim();
    }

    // Sanitize description if provided
    if (updateData.description !== undefined) {
      updateData.description = updateData.description 
        ? sanitizeHtml(updateData.description, { allowedTags: [], allowedAttributes: {} })
        : null;
    }

    // Check if todo exists and user owns it
    const existingTodo = await this.findOne(id, userId);

    // Optimistic locking check
    if (existingTodo.version !== version) {
      throw new ConflictException('Version mismatch - todo was modified by another user');
    }

    // Update with version increment
    return this.prisma.todo.update({
      where: { id },
      data: {
        ...updateData,
        version: existingTodo.version + 1,
      },
    });
  }

  async remove(id: string, userId: string) {
    // Check if todo exists and user owns it
    await this.findOne(id, userId);

    await this.prisma.todo.delete({
      where: { id },
    });
  }

  async bulkCreate(bulkCreateDto: BulkCreateTodoDto, userId: string) {
    const { todos } = bulkCreateDto;

    // Validate all todos before creating any
    for (let i = 0; i < todos.length; i++) {
      const todo = todos[i];
      if (!todo.title || todo.title.trim().length === 0) {
        throw new BadRequestException(`Todo at index ${i}: Title cannot be empty`);
      }
      if (todo.title.length > 250) {
        throw new BadRequestException(`Todo at index ${i}: Title must not exceed 250 characters`);
      }
    }

    // Create all todos in a transaction
    return this.prisma.$transaction(async (tx) => {
      const createdTodos = [];
      for (const todo of todos) {
        const sanitizedDescription = todo.description 
          ? sanitizeHtml(todo.description, { allowedTags: [], allowedAttributes: {} })
          : null;

        const created = await tx.todo.create({
          data: {
            title: todo.title.trim(),
            description: sanitizedDescription,
            ownerId: userId,
          },
        });
        createdTodos.push(created);
      }
      return createdTodos;
    });
  }

  async bulkDelete(bulkDeleteDto: BulkDeleteTodoDto, userId: string) {
    const { ids } = bulkDeleteDto;

    // Get all todos that belong to the user
    const userTodos = await this.prisma.todo.findMany({
      where: {
        id: { in: ids },
        ownerId: userId,
      },
      select: { id: true },
    });

    const userTodoIds = userTodos.map(todo => todo.id);
    const notFound = ids.filter(id => !userTodoIds.includes(id));

    // Delete only the todos that belong to the user
    if (userTodoIds.length > 0) {
      await this.prisma.todo.deleteMany({
        where: {
          id: { in: userTodoIds },
        },
      });
    }

    return {
      deleted: userTodoIds,
      notFound,
    };
  }
}
