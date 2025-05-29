import { Module } from '@nestjs/common';
import { AssessmentService } from './assessment.service';
import { AssessmentController } from './assessment.controller';
import { MongooseModule } from '@nestjs/mongoose';

import { Assessment, AssessmentSchema } from './schemas/assessment.schema';
import {
  AssessmentResponse,
  AssessmentResponseSchema,
} from './schemas/assessment-response.schema';

@Module({
  controllers: [AssessmentController],
  providers: [AssessmentService],
  imports: [
    MongooseModule.forFeature([
      { name: Assessment.name, schema: AssessmentSchema },
      { name: AssessmentResponse.name, schema: AssessmentResponseSchema },
    ]),
  ],
})
export class AssessmentModule {}
