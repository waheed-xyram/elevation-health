import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer-core';
import { executablePath as localChromePath } from 'puppeteer';

@Injectable()
export class ReportService {
  getExecutablePath(): string {
    return process.env.PUPPETEER_EXECUTABLE_PATH || localChromePath();
  }
  

  async generatePDF(url: string, authHeader?: string, userId?: string): Promise<Buffer> {

    const browser = await puppeteer.launch({
      headless: true,
      executablePath: this.getExecutablePath(),
      protocolTimeout: 120000,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-software-rasterizer',
        '--disable-background-networking',
        '--disable-default-apps',
        '--disable-extensions',
        '--disable-sync',
        '--disable-translate',
        '--hide-scrollbars',
        '--metrics-recording-only',
        '--mute-audio',
        '--no-first-run',
        '--safebrowsing-disable-auto-update',
        '--enable-features=NetworkService',
        '--window-size=1280,1024'
      ]
    });
    
    

    const page = await browser.newPage();

    // Set Authorization header if provided
    if (authHeader) {
      await page.setExtraHTTPHeaders({
        Authorization: authHeader,
      });
    }

    try {
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 60000, // increase this too
      });
    } catch (err) {
      console.error('Error loading page in Puppeteer:', err.message);
      throw err;
    }
    

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
    });

    await browser.close();

    return Buffer.from(pdf);
  }
}
