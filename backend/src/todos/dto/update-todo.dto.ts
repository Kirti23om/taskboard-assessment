import { IsString, IsOptional, IsBoolean, IsInt, MaxLength } from 'class-validator';

export class UpdateTodoDto {
  @IsOptional()
  @IsString()
  @MaxLength(250, { message: 'Title must not exceed 250 characters' })
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @IsInt({ message: 'Version is required for optimistic locking' })
  version: number;
}
