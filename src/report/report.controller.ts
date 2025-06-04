import { Controller, Get, Query, Res, Headers } from '@nestjs/common';
import { ReportService } from './report.service';
import { Response } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Report')
@Controller('report')
@ApiBearerAuth()
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('screenshot')
  async getScreenshot(@Query('url') url: string, @Res() res: Response) {
    const image = await this.reportService.generateScreenshot(url);
    res.setHeader('Content-Type', 'image/png');
    res.send(image);
  }

  @Get('pdf')
  async getPDF(@Query('url') url: string, @Res() res: Response,  @Headers('authorization') authHeader: string) {
    const pdf = await this.reportService.generatePDF(url, authHeader);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="report.pdf"');
    res.send(pdf);
  }
}
