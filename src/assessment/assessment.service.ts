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

      const assessments = await this.assessmentModel.find().select('_id name description status assessmentPercentage updatedAt').lean();

      const modifiedAssessments= assessments.map( res => ({...res, 'assessmentPercentage':'0%', 'status':'ToDo'}))
  
      
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

  async saveAssessmentResponse(assessmentResponse: CreateAssessmentDto, userId: string, assessmentId: string){
    try {
      const doAssessmentReponseExist = await this.assessmentResponseModel.find({assessmentId});

      if(doAssessmentReponseExist && doAssessmentReponseExist.length > 0){

        return this.updateAssessmentResponse(assessmentResponse, userId, assessmentId)
      }

      
      const assessmentScore = this.calculateAssessmentScore (assessmentResponse.assessmentResponse)
      
      await this.assessmentResponseModel.create({
        userId: userId,
        assessmentId: assessmentId,
        status: assessmentResponse.status,
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
}
