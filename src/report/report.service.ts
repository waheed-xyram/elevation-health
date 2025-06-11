import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer-core';
import { executablePath } from 'puppeteer';
import * as os from 'os';


console.log(executablePath());

@Injectable()
export class ReportService {
  getExecutablePath(): string {
    return process.env.PUPPETEER_EXECUTABLE_PATH;
  }
  

  async generatePDF(url: string, authHeader?: string, userId?: string): Promise<Buffer> {

    const platform = os.platform();
    let executablePath: string;

  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
  } else {
    if (platform === 'win32') {
      executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    } else if (platform === 'darwin') {
      executablePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    } else {
      executablePath = '/usr/bin/chromium'; // or 'chromium-browser'
    }
  }

    const browser = await puppeteer.launch({
      headless: true,
      executablePath,
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
