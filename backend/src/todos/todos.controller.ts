import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query, 
  UseGuards, 
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { BulkCreateTodoDto } from './dto/bulk-create-todo.dto';
import { BulkDeleteTodoDto } from './dto/bulk-delete-todo.dto';

@Controller('todos')
@UseGuards(JwtAuthGuard)
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post()
  async create(@Body() createTodoDto: CreateTodoDto, @Request() req) {
    return this.todosService.create(createTodoDto, req.user.id);
  }

  @Get()
  async findAll(@Query('filter') filter: 'all' | 'completed' | 'pending', @Request() req) {
    return this.todosService.findAll(req.user.id, filter);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    return this.todosService.findOne(id, req.user.id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateTodoDto: UpdateTodoDto, @Request() req) {
    return this.todosService.update(id, updateTodoDto, req.user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Request() req) {
    await this.todosService.remove(id, req.user.id);
  }

  @Post('bulk-create')
  async bulkCreate(@Body() bulkCreateDto: BulkCreateTodoDto, @Request() req) {
    return this.todosService.bulkCreate(bulkCreateDto, req.user.id);
  }

  @Post('bulk-delete')
  @HttpCode(HttpStatus.OK)
  async bulkDelete(@Body() bulkDeleteDto: BulkDeleteTodoDto, @Request() req) {
    return this.todosService.bulkDelete(bulkDeleteDto, req.user.id);
  }
}
