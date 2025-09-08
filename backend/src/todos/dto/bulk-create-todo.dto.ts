import { IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateTodoDto } from './create-todo.dto';

export class BulkCreateTodoDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one todo is required' })
  @ValidateNested({ each: true })
  @Type(() => CreateTodoDto)
  todos: CreateTodoDto[];
}
