import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { IUserAuthentication } from './interface/auth.interface';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from './dto/UserResponseDto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  @ApiBody({
    schema:{
      type:'object',
      properties:{
        email:{type: 'string', example: 'user@mail.com'},
        password:{type:'string', example:'strongPassword'}
      },
      required:['email','password']
    }
  })

  @ApiResponse({status:200, description:'Login Successful'})
  async login(@Body() body:{email: string, password: string}){
    const user: IUserAuthentication = await this.authService.validateUser(body.email, body.password);

    const token = this.authService.generateToken({ userId: user._id, email: user.email });

    return {token, user: plainToInstance(UserResponseDto, user, {excludeExtraneousValues: true})};
  }

}
