import { Controller, Get, Post, Body, Req, Param, UseInterceptors, UploadedFile, Query } from '@nestjs/common';
import { AssessmentService } from './assessment.service';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiBody, ApiConsumes,  ApiParam } from '@nestjs/swagger';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { ValidateAssessmentDto} from './dto/validate-assessment.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3Service } from '../aws/s3.service';
import { Express } from 'express';

@ApiTags('Assessments')
@ApiBearerAuth()
@Controller('assessment')
export class AssessmentController {
  constructor(private readonly assessmentService: AssessmentService, private readonly s3Service: S3Service) {}


  @Get('list')
  findAll(@Req() req: Request & { user?: { userId: string } }) {
    const userId = req.user?.userId;

    return this.assessmentService.findAll(userId);
  }

  @Post('submit/:assessmentId')
  saveAssessmentScore(
  @Body() assessmentResponse: CreateAssessmentDto,
  @Req() req:Request & {user?: {userId:string}},
  @Param('assessmentId') assessmentId: string){
    const userId = req.user?.userId;

    return this.assessmentService.saveAssessmentResponse(assessmentResponse, userId, assessmentId)
  }

  @Post('validate/:assessmentId')
  validateAssessment(
    @Param('assessmentId') assessmentId: string,
    @Req() req:Request & {user?:{userId: string}},
    @Body() assessmentResponse: ValidateAssessmentDto
  ){
    return this.assessmentService.validateAssessment(assessmentResponse, assessmentId);
  }

  @Get('report')
  generateAssessmentReport(
    @Query('assessmentId') assessmentId:string,
    @Req() req:Request & {user?: {userId: string}}){
    const userId = req.user?.userId;

    return this.assessmentService.generateAssessmentReport(assessmentId, userId)
  }

  @Post('upload/:assessmentId/:questionId')
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
    @Param('assessmentId') assessmentId: string,
    @Param('questionId') questionId: string,
  ) {
    const userId = req.user?.userId;
    const fileKey = `${assessmentId}-${questionId}-${userId}-${file.originalname}`;
  
    const s3result = await this.s3Service.uploadFile(file.buffer, fileKey, file.mimetype);

    console.log(`s3result ${JSON.stringify(s3result)}`)
  
    const url = `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
  
    return { url };
  }

  @Get('stats')
  async getAssessemntStats(
    @Req() req: Request &{user?: {userId: string}}
  ){
    const userId = req.user?.userId;
    return await this.assessmentService.getAssessemntStats(userId)
  }
  

}

