import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Document, Types } from 'mongoose';

export type AssessmentResponseDocument = HydratedDocument<AssessmentResponse>;

@Schema({ timestamps: true })
export class AssessmentResponse extends Document {
  @Prop({type: String, required: true})
  userId: string;

  @Prop({type:String, required:true})
  assessmentId: string;

  @Prop({type: String, required: true})
  assessmentResponse: string;

  @Prop()
  assessmentPercentage: string;

  @Prop()
  assessmentOverallPercentage: string;

  @Prop({ type: String, required: true})
  status: string;

  updatedAt?: Date;

  @Prop({type: Date, default: Date.now})
  createdAt?: Date;
}

export const AssessmentResponseSchema =
  SchemaFactory.createForClass(AssessmentResponse);
