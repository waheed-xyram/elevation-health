import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { Connection, Model } from 'mongoose';
import { AssessmentModule } from './assessment/assessment.module';
import { SeederModule } from './seeder/seeder.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './common/guards/jwt_auth.gaurd';
import { AuthService } from './auth/auth.service';
import { AwsModule } from './aws/s3.module';
import { MailService } from './mail/mail.service';
import { User, UserDocument } from './user/schemas/user.schema';
import { MailModule } from './mail/mail.module';
import { ReportModule } from './report/report.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),

    MongooseModule.forRoot(`${process.env.MONGO_DB_URI}`, {
      onConnectionCreate: (connection: Connection) => {
        connection.on('connected', () => console.log('connected'));
        connection.on('open', () => console.log('open'));
        connection.on('disconnected', () => console.log('disconnected'));
        connection.on('reconnected', () => console.log('reconnected'));
        connection.on('disconnecting', () => console.log('disconnecting'));

        return connection;
      },
    }),

    UserModule,
    AssessmentModule,
    SeederModule,
    AuthModule,
    AwsModule,
    MailModule,
    ReportModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useFactory: (
        authService: AuthService,
        reflector: Reflector,
        userModel: Model<UserDocument>,
      ) => new JwtAuthGuard(authService, reflector, userModel),
      inject: [AuthService, Reflector, getModelToken(User.name)],
    },
    MailService,
  ],
})
export class AppModule {}
