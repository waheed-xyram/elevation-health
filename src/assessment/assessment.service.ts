/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Assessment} from './schemas/assessment.schema'
import { AssessmentResponse } from './schemas/assessment-response.schema';
import {Model} from 'mongoose';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { IAssessmentResult, IStepQuestion } from './interface/assessment.interface';


@Injectable()
export class AssessmentService {

  constructor(@InjectModel(Assessment.name) private readonly assessmentModel:Model<Assessment>, 
@InjectModel(AssessmentResponse.name) private assessmentResponseModel:Model<AssessmentResponse>
){
  }

  async findAll(userId) {
    try {

      const respondantAssessment = await this.assessmentResponseModel.aggregate([
        {$match:{userId:userId}},{
          $addFields:{
            assessmentObjectId:{$toObjectId:"$assessmentId"}
          }
        },
        {$lookup:{
          from: 'assessments',
          localField:'assessmentObjectId',
          foreignField:'_id', 
          as:'assessmentDetails'}
        },{$unwind:'$assessmentDetails'},{
          $match:{
            'assessmentDetails.assessmentValidity':{$gt: new Date()},
            'assessmentDetails.isActive':true
          }
        },{
          $addFields:{
            assessmentDetails:{
              name:'$assessmentDetails.name',
              description:'$assessmentDetails.description',
              assessmentVersion:'$assessmentDetails.assessmentVersion'
            }
          }
        }]).exec();

      const assessments = await this.assessmentModel.find().select('_id name description status assessmentPercentage updatedAt assessmentAttempt').lean();

      const modifiedAssessments= assessments.map( res => ({...res, 'assessmentPercentage':'0%', 'status':'ToDo', 'assessmentAttempt':0}))
  
      
      if (respondantAssessment.length > 0) {

        const assessmentResults: IAssessmentResult[] = [];

        respondantAssessment.forEach(res => {
          
          const assessmentResult: IAssessmentResult = {
              assessmentId: res.assessmentId,
              status: res.status,
              updatedAt: res.updatedAt,
              name:res.assessmentDetails.name,
              description: res.assessmentDetails.description,
              assessmentPercentage: res.assessmentOverallPercentage
          }
          
          assessmentResults.push(assessmentResult)
      })

      const respondedAssessmentIds = new Set(assessmentResults.map( res => res.assessmentId.toString()));

      const allResponses = modifiedAssessments.filter( res => !respondedAssessmentIds.has(res._id.toString()))
      .map( res => ({
        assessmentId: res._id,
              status: 'ToDo',
              updatedAt: res.updatedAt,
              name:res.name,
              description: res.description,
              assessmentPercentage: '0%'
      }))

      return [...allResponses, ...assessmentResults];
        
      }
      

      return modifiedAssessments;
    } catch (error) {
      throw new Error(`Failed to fetch assessments: ${error?.message ?? error}`);
    }
  }

  private getMissingQuestions(steps: any[], assessmentResponse: CreateAssessmentDto){
    return steps.map(({title, required = []}) => {
      const missing = required.filter((qkey) => !this.isQuestionAnswered(title, qkey, assessmentResponse));

      return missing.length ? {title, missingQuestions:missing} : {title,missingQuestions:null};
    })
  }

  private isQuestionAnswered(title: string, questionKey: string, response: CreateAssessmentDto): boolean {
  
    const stepSection = response.assessmentResponse?.[title];
    if (!stepSection) return false;
  
    const answer = stepSection[questionKey];
    if (!answer) return false;
  
    return answer.value !== null;
  }
  
  
  
  private async validateAssessmentResponse(assessmentResponse: CreateAssessmentDto, assessmentId: string){
    const assessment = await this.assessmentModel.findOne({_id: assessmentId}).select('_id name steps').lean()
    
    if(!assessment) throw new Error(`Assessment not found`)

      return this.getMissingQuestions(assessment.steps, assessmentResponse)
  }

  private async getAssessmentAttempts(assessmentId: string, userId: string){
    const assessment = await this.assessmentResponseModel.findOne({__id: assessmentId, userId}).lean()

    console.log(`assessment attempt ${assessment}`)
    return assessment;
  }

  async validateAssessment(assessmentResponse: CreateAssessmentDto, assessmentId: string){
    const assessmentValidation = await this.validateAssessmentResponse(assessmentResponse, assessmentId);

      if(assessmentValidation && assessmentValidation.length > 0){
        return {message:'Assessment Incomplete. Please answer all questions',missedQuestions: assessmentValidation};
      }
  }

  async saveAssessmentResponse(assessmentResponse: CreateAssessmentDto, userId: string, assessmentId: string){
    try {
      let assessmentAttemptCount = 0;
      const assessmentValidation = await this.validateAssessmentResponse(assessmentResponse, assessmentId);

      const assessmentAttempts = await this.getAssessmentAttempts(assessmentId, userId);
      assessmentAttemptCount = (assessmentAttempts == null) ? assessmentAttemptCount++ : Number(assessmentAttempts) + 1 ;

      if(assessmentValidation && assessmentValidation.length > 0){
        return {message:'Assessment Incomplete. Please answer all questions',missedQuestions: assessmentValidation};
      }

      const doAssessmentReponseExist = await this.assessmentResponseModel.find({assessmentId});

      if(doAssessmentReponseExist && doAssessmentReponseExist.length > 0){

        return this.updateAssessmentResponse(assessmentResponse, userId, assessmentId)
      }

      
      const assessmentScore = this.calculateAssessmentScore (assessmentResponse.assessmentResponse)
      
      await this.assessmentResponseModel.create({
        userId: userId,
        assessmentId: assessmentId,
        status: assessmentResponse.status,
        assessmentAttempt: assessmentAttemptCount,
        assessmentResponse: JSON.stringify(assessmentResponse.assessmentResponse),
        assessmentPercentage: JSON.stringify(assessmentScore.assessmentPercentage),
        assessmentOverallPercentage: `${assessmentScore.assessmentOverallPercentage}%` || '0%',
        createdAt: new Date()
      });
      
      return {
        ...assessmentScore,
        status: assessmentResponse.status,
        assessmentId,
      };
      
    } catch (error) {
      throw new Error(`Failed to save assessments: ${error}`)

    }
  }

  async updateAssessmentResponse(assessmentResponse: CreateAssessmentDto, userId: string, assessmentId: string){
    try {
      const assessmentCalculation = this.calculateAssessmentScore (assessmentResponse.assessmentResponse)

      await this.assessmentResponseModel.updateOne({userId, assessmentId},{$set:{
        status: assessmentResponse.status,
        assessmentAttempt: 1, 
        assessmentResponse:JSON.stringify( assessmentResponse.assessmentResponse),
        assessmentPercentage:JSON.stringify(assessmentCalculation.assessmentPercentage),
        assessmentOverallPercentage: `${assessmentCalculation.assessmentOverallPercentage}%` || '0%',
        updatedAt: new Date()}})

      const updatedDoc = await this.assessmentResponseModel.findOne({ userId, assessmentId }).lean();
      
      if (!updatedDoc) {
        throw new Error('Updated assessment not found');
      }

      const {status} = updatedDoc
     
      return {
        ...assessmentCalculation,
        status,
        assessmentId,
      };
      
    } catch (error) {
      throw new Error(`Failed to update assessments: ${error}`)
    }
  }

  
calculateAssessmentOverallPercentage(assessmentResponse: any) {
  let totalRelevantQuestions = 0;
  let totalCompletedQuestions = 0;

  for (const [stepkey, question] of Object.entries(assessmentResponse)) {
    for (const value of Object.values(question)) {
      if (value && typeof value === 'object' && !value.ignore) {
        totalRelevantQuestions++;
        
        if (value.value !== null) {
          totalCompletedQuestions++;
        }
      }
    }
  }

  return totalRelevantQuestions > 0 
    ? Math.round((totalCompletedQuestions / totalRelevantQuestions) * 100)
    : 0;
}

calculateAssessmentScore(assessmentResponse: any) {
  try {
    if (assessmentResponse) {
      const assessmentPercentage = {};

      for (const [stepkey, question] of Object.entries(assessmentResponse)) {
        let stepScore = 0;
        let completedQuestions = 0;
        let totalRelevantQuestions = 0; 

        for (const value of Object.values(question)) {
          if (value && typeof value === 'object') {
            if (!value.ignore) {
              totalRelevantQuestions++;
              
              if ('score' in value) {
                stepScore += value.score;
                completedQuestions++;
              }
            }
          }
        }

        const percentage = totalRelevantQuestions > 0 
          ? (completedQuestions / totalRelevantQuestions) * 100 
          : 0;
        
        assessmentPercentage[stepkey] = Math.round(percentage);
      }

      const assessmentOverallPercentage = this.calculateAssessmentOverallPercentage(assessmentResponse);

      return {
        assessmentPercentage,
        assessmentOverallPercentage,
      };
    }
  } catch (error) {
    console.log(`Error while calculating assessment score: ${error}`);
    throw new Error(`Failed to calculate assessment score: ${error}`);
  }
}

async generateAssessmentReport(assessmentId: string, userId: string){
  try {
    const respondantAssessments = await this.assessmentResponseModel.find({assessmentId, userId}).lean();

    const assessmentScoreObj = {};
    respondantAssessments.forEach(res => {
      const response = JSON.parse(res.assessmentResponse);
      for (const [step, questions] of Object.entries(response)) {
        const level = [];
        if (questions && typeof questions === 'object' && !Array.isArray(questions)) {
          for (const ans in questions) {
            const question = questions[ans] as IStepQuestion;
            level.push({ level: question?.level || null});
          }
          assessmentScoreObj[step] = level;
        }
        const assessmentPercentage = JSON.parse(res.assessmentPercentage)
        assessmentScoreObj[`${step}_percentage`] =  `${assessmentPercentage[step]}%`
      }
      assessmentScoreObj['OverallScore'] = res.assessmentOverallPercentage;
    })

    return assessmentScoreObj;
  } catch (error) {
    throw new Error(`Failed to generate assessment Report: ${error}`)
  }
}

normalizeStatus(status: string | undefined): string {
  console.log('status',status)
  if (!status) return '';  // empty string means skip
  return status.toLowerCase().replace(/\s+/g, '_');
}

async getAssessemntStats(userId: string){
  try{
    const userAssessments = await this.assessmentResponseModel.find({userId}).lean();

    const total_assessmens = userAssessments.length;

    const counts = {
      in_progress: 0,
      completed: 0,
      todo: 0,
    };

    for (const assessment of userAssessments) {
      const normStatus = this.normalizeStatus(assessment.status);
      if (counts.hasOwnProperty(normStatus)) {
        counts[normStatus]++;
      }
    }

    return {
      total_assessmens,
      ...counts,
    };
  }catch(error){
    throw new Error(`Failed to get assessment assessment: ${error}`)
  }
}
}
