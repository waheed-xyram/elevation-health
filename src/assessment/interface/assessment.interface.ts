import { Document } from 'mongoose';

export interface IAssessment {
  name: string;
  description: string;
  assessmentValidity: Date;
  assessmentVersion: string;
  isActive: boolean;
  assessment: string;
  title?: string;
  metaData?: string;
  steps?: ISteps;
  validation?: string;
  ui?: string;
  scoring?: string;
  fileUpload?: string;
  reporting?: string;
}

export interface IStepQuestion {
  value: string | null;
  score?: number;
  level?: string;
  ignore?: boolean;
}

export interface IAssessmentResponseQuestion {
  step_0?: Record<string, IStepQuestion>;
  step_1?: Record<string, IStepQuestion>;
  step_2?: Record<string, IStepQuestion>;
  step_3?: Record<string, IStepQuestion>;
}

export interface IAssessmentResponse extends Document {
  assessmentResponse: IAssessmentResponseQuestion;
  status: IAssessmentStatus;
  createdAt?: Date;
  updatedAt?: Date;
}
export interface IAssessmentStatus {
  ToDO: string;
  InProgress: string;
  Completed: string;
}

export interface ISteps {
  stepId: string;
  stepNumber: number;
  title: string;
  description: string;
  icon: string;
  color: string;
  estimatedTime: string;
  totalQuestions: number;
  maxScore: number;
  helpText: string;
  reference: object;
  validations: object;
  properties: object;
  required: [object];
}
