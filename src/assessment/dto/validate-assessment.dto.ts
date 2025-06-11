import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, ValidateNested, IsOptional, IsObject, IsIn, IsNumber,  } from 'class-validator';

export class StepQuestionDto {
  @ApiProperty({ type: String, required: false, nullable: true })
  value: string | null;

  @ApiProperty({ required: false })
  @IsOptional()
  score?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  level?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  ignore?: boolean;
}

export class ValidateAssessmentDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsObject()
  @ValidateNested({ each: true })
  @Type(() => StepQuestionDto)
  assessmentResponse: Record<string, StepQuestionDto>;  
}
