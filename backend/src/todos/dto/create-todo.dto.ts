import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateTodoDto {
  @IsString()
  @MaxLength(250, { message: 'Title must not exceed 250 characters' })
  title: string;

  @IsOptional()
  @IsString()
  description?: string;
}
