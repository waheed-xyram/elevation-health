/* eslint-disable prettier/prettier */
import { BadRequestException, HttpException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import {User, UserDocument} from '../user/schemas/user.schema'
import {Model} from 'mongoose'; 
import {InjectModel} from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { IUserDetails } from './interface/auth.interface';
import {MailService} from '../mail/mail.service';
import {forgetPassword} from '../mail/template/forget-password';
@Injectable()
export class AuthService {

    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>, private mailService: MailService){}

    async validateUser(email: string, password: string): Promise<any> {
        const user = await this.userModel.findOne({ email }).lean();
    
        if (!user) {
            throw new UnauthorizedException('Invalid Credentials');
        }
    
        const isMatch = await bcrypt.compare(password, user.password);
    
        if (!isMatch) {
            throw new UnauthorizedException('Invalid Credentials');
        }
    
        return user as unknown as IUserDetails;
    }
    

    generateToken(payload:any, secretKey: string, expireTime: string):string{
        return jwt.sign(payload, secretKey, {expiresIn: expireTime})
    }

    async forgetPassword(email: string){
        try {
            const doUserExist = await this.userModel.aggregate([{$match:{'email':email}}]).exec();

            if(doUserExist && doUserExist.length > 0){
                const payload = {email};
                
                const forgetPasswordToken = this.generateToken(payload, process.env.FORGET_PASSWORD_TOKEN, process.env.FORGET_PASSWORD_EXPIRY);

                const savedToken = await this.saveToken(doUserExist[0].email, forgetPasswordToken)

                if(savedToken.acknowledged){
                    const htmlContent = forgetPassword;
//                  
                    this.mailService.sendEmail(doUserExist[0].email, 'Reset Password Link', htmlContent);
                }
        
                return {message: `Message Sent successfully`,forgetPasswordToken};
            }

            return {message: 'Invalid details'}
        } catch (error) {
            throw new Error(`Failed to validate forget Password: ${error}`);
        }
    }

    async saveToken(email:string, token: string){
        try{

            const doTokenSaved = await this.userModel.updateOne({email},{$set:{token:token}}).lean()
    
            return doTokenSaved;
        }catch(error){
            console.log(`Error in saving token ${error}`);

            throw new InternalServerErrorException(`Failed to Login, please try again`)
        }
    }

    async resetPassword(email: string, newPassword: string, confirmPassword: string, token: string) {
        try {
            this.validatePasswords(newPassword, confirmPassword);
    
            this.verifyToken(token, process.env.FORGET_PASSWORD_TOKEN);
    
            const user = await this.userModel.findOne({ token }).exec();
            if (!user) {
                throw new HttpException('Invalid reset link or token.', HttpStatus.BAD_REQUEST);
            }
    
            const saltRounds = Number(process.env.SALT_ROUNDS);
            const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

            const updateResult = await this.userModel.updateOne(
                { email },
                { $set: { password: hashedPassword } }
            ).lean();
    
            if (updateResult.acknowledged) {
                return { message: 'Password updated successfully' };
            }
    
            throw new HttpException('Failed to save password.', HttpStatus.INTERNAL_SERVER_ERROR);
    
        } catch (error) {
            this.handleResetPasswordErrors(error);
        }
    }
    
    private validatePasswords(newPassword: string, confirmPassword: string) {
        if (newPassword !== confirmPassword) {
            throw new HttpException('Passwords do not match.', HttpStatus.BAD_REQUEST);
        }
    }
    
    verifyToken(token: string, secret: string) {
        try {
            return jwt.verify(token, secret);
        } catch (err) {
            if (err instanceof jwt.TokenExpiredError) {
                throw new HttpException('Reset link has expired. Please request a new one.', HttpStatus.GONE);
            } else if (err instanceof jwt.JsonWebTokenError) {
                throw new HttpException('Invalid token.', HttpStatus.BAD_REQUEST);
            } else {
                throw new HttpException('Something went wrong while verifying the token.', HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }
    
    private handleResetPasswordErrors(error: any) {
        if (error instanceof HttpException) {
            throw error;
        }
        throw new HttpException(`Failed to reset password: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    async logout(token: string){
        if(!token) throw new BadRequestException('Invalid user or Session not exist');
        try{

            const result =await this.userModel.updateOne({token},{$unset:{token:''}});

            if (!result || result.modifiedCount === 0) {
                throw new NotFoundException('User not found or already logged out');
              }
        }
        catch(error){
            console.log(`Failed to logout. Please try again later. ${error}`)
            throw new InternalServerErrorException('Failed to logout. Please try again later.')
        }
    }

}
