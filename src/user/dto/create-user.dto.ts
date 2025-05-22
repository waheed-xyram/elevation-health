import {
  IsString,
  IsInt,
  IsEmail,
  IsNotEmpty,
  IsJSON,
  Matches,
  Min,
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
  @Matches(/^\d{10}$/, { message: 'Mobile number must be 10 digit' })
  mobileNumber: string;

  @ApiProperty({
    example: '{"address1": "2nd cross", "city": "New York"}',
    description: 'Must be a valid JSON string',
  })
  @IsJSON()
  address: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  roleId: number;
}
