import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';

@Injectable()
export class ReportService {
  async generateScreenshot(url: string): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 0, // Allow for slow-loading pages
    });

    const screenshot = await page.screenshot({ fullPage: true });

    await browser.close();
    return screenshot as Buffer;
  }

  async generatePDF(url: string, authHeader: string): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    await page.setExtraHTTPHeaders({
      Authorization: authHeader,
    });

    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 0,
    });

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
    });

    await browser.close();
    return pdf as Buffer;
  }
}
