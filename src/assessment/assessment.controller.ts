import { Controller, Get, Post, Body, Req, Param, UseInterceptors, UploadedFile, Query } from '@nestjs/common';
import { AssessmentService } from './assessment.service';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiBody, ApiConsumes,  ApiParam } from '@nestjs/swagger';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3Service } from '../aws/s3.service';
import { Express } from 'express';

@ApiTags('Assessments')
@ApiBearerAuth()
@Controller('assessment')
export class AssessmentController {
  constructor(private readonly assessmentService: AssessmentService, private readonly s3Service: S3Service) {}


  @Get()
  findAll(@Req() req: Request & { user?: { userId: string } }) {
    const userId = req.user?.userId;

    return this.assessmentService.findAll(userId);
  }

  @Post('calculate-score/:assessmentId')
  saveAssessmentScore(
  @Body() assessmentResponse: CreateAssessmentDto,
  @Req() req:Request & {user?: {userId:string}},
  @Param('assessmentId') assessmentId: string){
    const userId = req.user?.userId;

    return this.assessmentService.saveAssessmentResponse(assessmentResponse, userId, assessmentId)
  }

  @Get('report')
  generateAssessmentReport(
    @Query('assessmentId') assessmentId:string,
    @Req() req:Request & {user?: {userId: string}}){
    const userId = req.user?.userId;

    console.log('----',assessmentId, userId)
    return this.assessmentService.generateAssessmentReport(assessmentId, userId)
  }

  @Post('upload/:questionId')
  @ApiOperation({ summary: 'Upload a file for a question' })
  @ApiParam({ name: 'questionId', required: true, type: String })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['file'],
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request & { user?: { userId: string } },
    @Param('questionId') questionId: string,
  ) {
    const userId = req.user?.userId;
    const fileKey = `${questionId}-${userId}-${file.originalname}`;
  
    const s3result = await this.s3Service.uploadFile(file.buffer, fileKey, file.mimetype);
  
    const url = `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
  
    return { url };
  }
  

}

