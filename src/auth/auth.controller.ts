import { Controller, Post, Body, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { IUserAuthentication } from './interface/auth.interface';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from './dto/UserResponseDto';
import { ForgetPassword } from './dto/forgetPasswordDto';
import { LoginDto } from './dto/loginDto';
import { ResetPassword } from './dto/resetPasswordDto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  @ApiResponse({status:200, description:'Login Successful'})
  @ApiResponse({status:401, description:'Invalid credentials'})
  @ApiResponse({status:400, description:'Validation failed'})
  async login(@Body() body:LoginDto){
    const user: IUserAuthentication = await this.authService.validateUser(body.email, body.password);

    const token = this.authService.generateToken({ userId: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET_KEY, process.env.JWT_EXPIRY);

    await this.authService.saveToken(body.email, token);

    return {token, user: plainToInstance(UserResponseDto, user, {excludeExtraneousValues: true})};
  }

  @Post('forget-password')
  @Public()
  async forgetPassword(@Body() body: ForgetPassword){
    const link: string | object = this.authService.forgetPassword(body.email);

    return link;
  }

  @Post('reset-password')
  @Public()
  async resetPassword(@Body() body:ResetPassword){
    const passwordReset = await this.authService.resetPassword(body.email, body.newPassword, body.confirmPassword, body.token);

    return passwordReset;
  }

  @Post('logout')
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Logout successfull' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(@Req() req: Request){
    const token: string = req.headers['authorization']?.split(' ')[1];

    await this.authService.logout(token)

    return { message: 'Logout successful' };
  }
}
