// mail.service.ts
import { Injectable } from '@nestjs/common';
import * as SibApiV3Sdk from 'sib-api-v3-sdk';

@Injectable()
export class MailService {
  private readonly client: SibApiV3Sdk.TransactionalEmailsApi;

  constructor() {
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = process.env.BREVO_API_KEY; // Set this in your .env

    this.client = new SibApiV3Sdk.TransactionalEmailsApi();
  }

  async sendEmail(to: string, subject: string, htmlContent: string): Promise<void> {
    try {
      const sender = { name: process.env.EMAIL_SENDER_NAME, email: 'syedwaheede2@gmail.com' };
      const receivers = [{ email: to }];

      await this.client.sendTransacEmail({
        sender,
        to: receivers,
        subject,
        htmlContent,
      });

      console.log(`Email sent to ${to}`);
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }
}
