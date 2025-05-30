/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Assessment} from './schemas/assessment.schema'
import { AssessmentResponse } from './schemas/assessment-response.schema';
import {Model} from 'mongoose';
import { CreateAssessmentDto } from './dto/create-assessment.dto';


@Injectable()
export class AssessmentService {

  constructor(@InjectModel(Assessment.name) private readonly assessmentModel:Model<Assessment>, 
@InjectModel(AssessmentResponse.name) private assessmentResponseModel:Model<AssessmentResponse>
){
  }

  async findAll(userId) {
    try {
      const respondantAssessment = await this.assessmentResponseModel.find({ userId }).exec();
      const assessments = await this.assessmentModel.find({ userId }).select('name description status').exec();
  
      if (respondantAssessment.length > 0) {
        const [assessmentResponse] = respondantAssessment.map(res => [JSON.parse(res.assessmentResponse), res.status, res.updatedAt]);
        const response = assessmentResponse[0]; 
  
        let totalQuestions = 0;
        let attemptedQuestions = 0;
        const stepStats = {};
  
        for (const stepKey in response) {
          const step = response[stepKey];
          let stepTotal = 0;
          let stepAttempted = 0;
          let stepScore = 0;
  
          for (const questionKey in step) {
            const answer = step[questionKey];
  
            if (!answer.ignore) {
              stepTotal++;
              totalQuestions++;
  
              if (answer.value !== null) {
                stepAttempted++;
                attemptedQuestions++;
  
                if (typeof answer.score === 'number') {
                  stepScore += answer.score;
                }
              }
            }
          }
  
          const stepPercentage = stepTotal > 0 ? (stepAttempted / stepTotal) * 100 : 0;
  
          stepStats[stepKey] = {
            stepTotal,
            stepAttempted,
            stepPercentage: (stepPercentage > 0) ? `${Math.round(stepPercentage)}%`: `0%`,
            stepScore,
          };
        }
  
        const overallPercentage = totalQuestions > 0 ? (attemptedQuestions / totalQuestions) * 100 : 0;
  
        const enhancedAssessments = assessments.map(assessment => {
          const obj = assessment.toObject();
        
          return {
            ...obj,
            status: assessmentResponse[1],
            updatedAt: assessmentResponse[2],
            overallStats: {
              totalQuestions,
              attemptedQuestions,
              percentageAnswered: (overallPercentage > 0) ? `${Math.round(overallPercentage)}%`: `0%`,
            },
          };
        });
        
        return enhancedAssessments;
        
      }
  
      return assessments;
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
        assessmentPercentage:JSON.stringify(assessmentCalculation.assessmentPercentage)}})

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
        let totalRelevantQuestions = 0; // Only count questions that are not ignored

        for (const value of Object.values(question)) {
          if (value && typeof value === 'object') {
            // Count all questions that are not ignored
            if (!value.ignore) {
              totalRelevantQuestions++;
              
              // Count completed questions (those with scores)
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
}
