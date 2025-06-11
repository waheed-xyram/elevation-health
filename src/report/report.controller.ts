import { Controller, Get, Query, Res, Headers, Param } from '@nestjs/common';
import { ReportService } from './report.service';
import { Response } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enum/role.enum';

@ApiTags('Report')
@Controller('report')
@ApiBearerAuth()
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('userReport')
  async getUserReport(
    @Query('url') url: string, 
    @Res() res: Response,  
    @Headers('authorization') authHeader: string) {
    const pdf = await this.reportService.generatePDF(url, authHeader);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename= Elevation-Health-${new Date()}.pdf`);
    res.send(pdf);
  }

  @Roles(UserRole.ADMIN)
  @Get('pdf/:userId')
  async getPdf(
    @Query('url') url: string, 
    @Res() res: Response,  
    @Headers('authorization') authHeader: string,
    @Param('userId') userId: string){
    const pdf = await this.reportService.generatePDF(url, authHeader, userId);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename= Elevation-Health-${new Date()}.pdf`);
    res.send(pdf);
  }
}
