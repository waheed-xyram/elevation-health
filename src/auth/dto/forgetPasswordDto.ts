import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgetPassword {
  @ApiProperty({ example: 'user@mail.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
