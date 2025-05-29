/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Assessment, AssessmentDocument } from '../assessment/schemas/assessment.schema';
import { IAssessment } from '../assessment/interface/assessment.interface';
import { Model } from 'mongoose';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as glob from 'glob-promise'

@Injectable()
export class SeederService {
    constructor(
        @InjectModel(Assessment.name) private readonly assessmentModel:Model<AssessmentDocument>){}

    async seed():Promise<void>{
        const datadir = path.join(__dirname,'data');
        const files = await glob(`${datadir.replace(/\\/g, '/')}/*.json`);

        const seedPromises = files.map(async (filepath)=>{
            const content = await fs.readFile(filepath, 'utf-8');
            const jsonData = JSON.parse(content) as IAssessment;

            const newAssessment = new this.assessmentModel({
                name: jsonData.name || jsonData.title,
                description: jsonData.description,
                assessmentVersion: jsonData.assessmentVersion,
                assessmentValidity: jsonData.assessmentValidity,
                assessment: jsonData?.assessment,
                isActive: jsonData.isActive,
                metaData: JSON.stringify(jsonData?.metaData),
                steps: jsonData?.steps,
                validation: JSON.stringify(jsonData?.validation),
                ui: JSON.stringify(jsonData?.ui),
                scoring: JSON.stringify(jsonData?.scoring),
                fileUpload: JSON.stringify(jsonData?.fileUpload),
                reporting: JSON.stringify(jsonData?.reporting),
            })

            await newAssessment.save();
            console.log(`Inserted: ${jsonData.name || jsonData.title}`)
        })

        await Promise.all(seedPromises);
        console.log(`All Assessments seeded successfully`);
    }
}
