import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { ValidateNested, IsOptional, IsObject, IsNotEmpty, IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateAssessmentDto, StepQuestionDto } from './create-assessment.dto';

export class UpdateAssessmentDto extends PartialType(CreateAssessmentDto) {
  @ApiProperty({ required: false, type: Object })
  @IsOptional()
  @IsObject()
  @ValidateNested({ each: true })
  @Type(() => StepQuestionDto)
  assessmentResponse?: Record<string, StepQuestionDto>;

   @ApiProperty({enum:['ToDo', 'InProgress', 'Completed']})
    @IsNotEmpty()
    @IsString()
    @IsIn(['ToDo', 'In Progress', 'Completed'])
    status: 'ToDo' | 'In Progress' | 'Completed';
}
