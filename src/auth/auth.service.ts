/* eslint-disable prettier/prettier */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import {User, UserDocument} from '../user/schemas/user.schema'
import {Model} from 'mongoose'; 
import {InjectModel} from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { IUserDetails } from './interface/auth.interface';

@Injectable()
export class AuthService {
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
    private readonly jwtSecret: string | any = process.env.JWT_SECRET_KEY;

    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>){}

    async validateUser(email: string, password:string):Promise<any>{
        const user = await this.userModel.findOne({email}).lean();

        if(!user)  throw new UnauthorizedException('Invalid Credentials');

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch) throw new UnauthorizedException('Invalid Credentials');

        return user as IUserDetails;
    }

    generateToken(payload:any):string{
        return jwt.sign(payload, this.jwtSecret, {expiresIn: '1d'})
    }

    verifyToken(token: string): any{
        return jwt.verify(token, this.jwtSecret)
    }
}
