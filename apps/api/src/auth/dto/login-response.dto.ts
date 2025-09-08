import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty({ enum: ['ADMIN', 'TESTER'] })
  role: string;
}
