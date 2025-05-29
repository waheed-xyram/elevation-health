import { Controller, Get, Post, Body, Req, Param } from '@nestjs/common';
import { AssessmentService } from './assessment.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateAssessmentDto } from './dto/create-assessment.dto';

@ApiTags('Assessments')
@ApiBearerAuth()
@Controller('assessment')
export class AssessmentController {
  constructor(private readonly assessmentService: AssessmentService) {}


  @Get()
findAll(@Req() req: Request & { user?: { userid: string } }) {
  const userId = req.user?.userid;
  console.log('Logged-in user ID:', userId);
  return this.assessmentService.findAll(userId);
}

  @Post('calculate-score/:assessmentId')
  saveAssessmentScore(
  @Body() assessmentResponse: CreateAssessmentDto,
  @Req() req:Request & {user?: {userid:string}},
  @Param('assessmentId') assessmentId: string){
    const userId = req.user?.userid;
    return this.assessmentService.saveAssessmentResponse(assessmentResponse, userId, assessmentId)
  }
}
