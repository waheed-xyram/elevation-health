import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsJSON,
  Matches,
  IsStrongPassword,
  IsIn,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsString()
  lastName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
    minUppercase: 1,
  })
  password: string;

  @ApiProperty()
  @Matches(/^\d{10}$/, { message: 'Mobile number must be 10 digit' })
  mobileNumber: string;

  @ApiProperty({
    example: '{"address1": "2nd cross", "city": "New York"}',
    description: 'Must be a valid JSON string',
  })
  @IsJSON()
  address: string;

  @ApiProperty()
  @IsString()
  @IsIn(['Admin', 'Incubator'])
  role: string;
}
