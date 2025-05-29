import { NestFactory } from '@nestjs/core';
import { SeederService } from './seeder.service';
import { AppModule } from '../app.module';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const seeder = app.get(SeederService);
  await seeder.seed();
  await app.close();
}

bootstrap();
