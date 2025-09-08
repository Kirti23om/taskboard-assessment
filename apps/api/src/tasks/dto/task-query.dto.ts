import { IsOptional, IsIn, IsEmail, IsNumberString, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class TaskQueryDto {
  @ApiProperty({ required: false, enum: ['todo', 'in_progress', 'done'] })
  @IsOptional()
  @IsIn(['todo', 'in_progress', 'done'])
  status?: string;

  @ApiProperty({ required: false, enum: ['low', 'med', 'high'] })
  @IsOptional()
  @IsIn(['low', 'med', 'high'])
  priority?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  assigneeEmail?: string;

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  page?: number;

  @ApiProperty({ required: false, default: 10 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  size?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty({ required: false, enum: ['asc', 'desc'] })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  order?: 'asc' | 'desc';
}
