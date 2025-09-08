import { IsArray, IsUUID, ArrayMinSize } from 'class-validator';

export class BulkDeleteTodoDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one ID is required' })
  @IsUUID('4', { each: true, message: 'Each ID must be a valid UUID' })
  ids: string[];
}
