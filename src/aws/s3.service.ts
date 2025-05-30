// s3.service.ts
import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import * as fs from 'fs';

@Injectable()
export class S3Service {
  private s3: S3Client;
  private bucketName = process.env.S3_BUCKET;

  constructor() {
    this.s3 = new S3Client({ region: process.env.AWS_REGION });
  }

  private sanitizeFileName(fileName: string): string {
    return fileName.replace(/[^a-zA-Z0-9_.-]/g, '_');
  }

 

  async uploadFile(
    fileBuffer: Buffer,
    fileKey: string,
    contentType: string,
  ): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
      Body: fileBuffer,
      ContentType: contentType,
    });

    await this.s3.send(command);
  }

  async downloadFile(s3Key: string): Promise<Readable | { error: true; message: string }> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key,
      });

      const data = await this.s3.send(command);
      return data.Body as Readable;
    } catch (error) {
      if (error.name === 'NoSuchKey') {
        return { error: true, message: `File with key "${s3Key}" not found in S3` };
      }
      return { error: true, message: `Error in downloading file: ${error.message}` };
    }
  }

  async deleteFile(s3Key: string) {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: s3Key,
    });

    return await this.s3.send(command);
  }
}
