/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { AuthService } from '../../auth/auth.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { Model } from 'mongoose';
import { UserDocument } from '../../user/schemas/user.schema';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService, private readonly reflector:Reflector, private userModel: Model<UserDocument>) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
      
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY,[context.getHandler(), context.getClass()])

    if(isPublic){
        return true;
    }

    const req = context.switchToHttp().getRequest<Request>();
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const token = authHeader.split(' ')[1];
    try {
      const tokenExists = await this.userModel.findOne({ token });

      if (!tokenExists) {
        throw new UnauthorizedException('Token is invalid or has been logged out');
      }

      const user = this.authService.verifyToken(token, process.env.JWT_SECRET_KEY);
      req['user'] = user;

      return true;
    } catch (error) {
        console.log(`Invalid or expired token: ${error}`)
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
