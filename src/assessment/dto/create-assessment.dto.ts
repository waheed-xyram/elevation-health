import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAssessmentDto {
  @ApiProperty({ type: Object })
  @IsNotEmpty()
  assessmentResponse: object;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  status: string;
}
