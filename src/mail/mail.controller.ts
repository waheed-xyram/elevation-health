// mail.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('send')
  async sendTestEmail(@Body() body: { to: string; subject: string; message: string }) {
    await this.mailService.sendEmail(body.to, body.subject, body.message);
    return { message: 'Email sent' };
  }
}
