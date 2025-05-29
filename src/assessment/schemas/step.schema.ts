import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Step {
  @Prop()
  stepId: string;

  @Prop()
  stepNumber: string;

  @Prop()
  title: string;

  @Prop()
  description: string;

  @Prop()
  icon: string;

  @Prop()
  color: string;

  @Prop()
  estimatedTime: string;

  @Prop()
  totalQuestions: number;

  @Prop()
  maxScore: number;

  @Prop()
  helpText: string;

  @Prop({ type: Object })
  reference: Record<string, any>;

  @Prop({ type: Object })
  validations: Record<string, any>;

  @Prop({ type: Object })
  properties: Record<string, any>;

  @Prop({ type: [Object] })
  required: Record<string, any>[];
}

export const StepSchema = SchemaFactory.createForClass(Step);
