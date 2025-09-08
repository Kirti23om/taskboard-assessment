import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({ example: 'Website Revamp' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
