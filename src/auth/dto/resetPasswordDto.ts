import { ApiProperty } from '@nestjs/swagger';
import {
  Equals,
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  ValidateIf,
} from 'class-validator';

export class ResetPassword {
  @ApiProperty({ example: 'user@mail.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: `Token` })
  @IsNotEmpty()
  @IsString()
  token: string;

  @ApiProperty({ example: 'New Password' })
  @IsNotEmpty()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
    minUppercase: 1,
  })
  newPassword: string;

  @ApiProperty({ example: 'Confirm Password' })
  @IsNotEmpty()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
    minUppercase: 1,
  })
  @ValidateIf((res) => res.newPassword !== res.confirmPassword)
  @Equals('newPassword', { message: 'confirmPassword must match password' })
  confirmPassword: string;
}
