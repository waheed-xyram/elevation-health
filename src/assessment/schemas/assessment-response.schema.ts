import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Document } from 'mongoose';

export type AssessmentResponseDocument = HydratedDocument<AssessmentResponse>;

@Schema({ timestamps: true })
export class AssessmentResponse extends Document {
  @Prop()
  userId: string;

  @Prop()
  assessmentId: string;

  @Prop()
  assessmentResponse: string;

  @Prop()
  assessmentPercentage: string;

  @Prop()
  status: string;

  updatedAt?: Date;
  createdAt?: Date;
}

export const AssessmentResponseSchema =
  SchemaFactory.createForClass(AssessmentResponse);
