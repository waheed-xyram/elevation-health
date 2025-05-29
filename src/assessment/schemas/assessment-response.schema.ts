import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AssessmentResponseDocument = HydratedDocument<AssessmentResponse>;

@Schema({ timestamps: true })
export class AssessmentResponse {
  @Prop()
  userId: string;

  @Prop()
  assessmentId: string;

  @Prop()
  assessmentResponse: string;

  @Prop()
  status: string;
}

export const AssessmentResponseSchema =
  SchemaFactory.createForClass(AssessmentResponse);
