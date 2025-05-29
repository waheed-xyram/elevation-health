import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Step, StepSchema } from './step.schema';

export type AssessmentDocument = HydratedDocument<Assessment>;

@Schema({ timestamps: true })
export class Assessment {
  @Prop()
  name: string;

  @Prop()
  description: string;

  @Prop()
  assessmentVersion: string;

  @Prop()
  assessmentValidity: Date;

  @Prop()
  assessment: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  metaData: string;

  @Prop({ type: [StepSchema] })
  steps: Step[];

  @Prop()
  validation: string;

  @Prop()
  ui: string;

  @Prop()
  scoring: string;

  @Prop()
  fileUpload: string;

  @Prop()
  reporting: string;
}

export const AssessmentSchema = SchemaFactory.createForClass(Assessment);
