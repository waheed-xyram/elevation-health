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
      await this.assessmentResponseModel.find({userId}).exec();

      const assessments = await this.assessmentModel.find({userId}).select('name description status').exec();

      return assessments;
    } catch (error) {
      throw new Error(`Failed to fetch assessments: ${error?.message ?? error}`)
    }

  }

  async saveAssessmentResponse(assessmentResponse: CreateAssessmentDto, userId: string, assessmentId: string){
    try {
      const doAssessmentReponseExist = await this.assessmentResponseModel.find({assessmentId});

      if(doAssessmentReponseExist && doAssessmentReponseExist.length > 0){

        return this.updateAssessmentResponse(assessmentResponse, userId, assessmentId)
      }

      await this.assessmentResponseModel.create({
        userId: userId,
        assessmentId:assessmentId,
        status: assessmentResponse.status,
        assessmentResponse: JSON.stringify(assessmentResponse.assessmentResponse)
      })

      const assessmentScore = this.calculateAssessmentScore (assessmentResponse.assessmentResponse)

      return {...assessmentScore}
    } catch (error) {
      throw new Error(`Failed to save assessments: ${error}`)

    }
  }

  async updateAssessmentResponse(assessmentResponse: CreateAssessmentDto, userId: string, assessmentId: string){
    try {
      
      await this.assessmentResponseModel.updateOne({userId, assessmentId},{$set:{status: assessmentResponse.status, assessmentResponse:JSON.stringify( assessmentResponse.assessmentResponse)}})

      const updatedDoc = await this.assessmentResponseModel.findOne({ userId, assessmentId }).lean();
      
      if (!updatedDoc) {
        throw new Error('Updated assessment not found');
      }
      
      const assessmentScore = this.calculateAssessmentScore (assessmentResponse.assessmentResponse)

      const {status} = updatedDoc
     
        return {
          ...assessmentScore,
          status,
          assessmentId,
        };
    } catch (error) {
      throw new Error(`Failed to update assessments: ${error}`)
    }
  }

     calculateAssessmentScore (assessmentResponse:any) {
    try {
      if(assessmentResponse){
        const assessmentScore = {};
        for(const [stepkey, question] of Object.entries(assessmentResponse)){
          let stepScore = 0;

          for(const value of Object.values(question)){
            if(value && typeof value == 'object' && 'score' in value){
              stepScore += value.score;
            }
          }

          assessmentScore[stepkey] = stepScore;

        }

        return assessmentScore;
      }
    } catch (error) {
      console.log(`Error while calculating assessment score: ${error}`);

      throw new Error(`Failed to calculate assessment score: ${error}`)
    }
  }


 
}
