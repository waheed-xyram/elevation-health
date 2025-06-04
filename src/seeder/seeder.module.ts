import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SeederService } from './seeder.service';
import { Assessment, AssessmentSchema } from '../assessment/schemas/assessment.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Assessment.name, schema: AssessmentSchema }])],
  providers: [SeederService],
  exports: [SeederService],
})
export class SeederModule {}
