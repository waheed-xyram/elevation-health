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

export interface IAssessmentResponse {
  _id: string;
  assessment: string;
  description: string;
  status: IAssessmentResponse;
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
