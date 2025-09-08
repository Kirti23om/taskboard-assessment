import { IsString, IsIn, IsOptional, IsEmail, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty({ example: 'Implement user authentication' })
  @IsString()
  // DEFECT 3: Validation gap - missing @IsNotEmpty() allows empty title
  title: string;

  @ApiProperty({ enum: ['todo', 'in_progress', 'done'], example: 'todo' })
  @IsIn(['todo', 'in_progress', 'done'])
  @IsOptional()
  status?: string;

  @ApiProperty({ enum: ['low', 'med', 'high'], example: 'med' })
  @IsIn(['low', 'med', 'high'])
  @IsOptional()
  priority?: string;

  @ApiProperty({ required: false, example: 'tester@test.io' })
  @IsEmail()
  @IsOptional()
  assigneeEmail?: string;

  @ApiProperty({ required: false, example: '2025-12-31T23:59:59.000Z' })
  @IsDateString()
  @IsOptional()
  dueDate?: string;
}
