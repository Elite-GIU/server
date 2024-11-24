import { Controller, Post, Body, Put } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { RegisterUserDto } from './dto/RegisterUserDto';
import { LoginUserDto } from './dto/LoginUserDto';
import { VerifyEmailDto } from './dto/VerifyEmailDto';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('auth')
@Controller('auth')

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // POST /auth/register - Register a new user
  @Post('register')
  @Public() 
  @ApiOperation({ summary: 'Register' })
  @ApiResponse({ status: 201, description: 'Account created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async register(@Body() userData: RegisterUserDto) {
    return this.authService.register(userData);
  }

  // PUT /auth/verify-email - Verify email using OTP
  @Put('verify-email')
  @Public() 
  @ApiOperation({ summary: 'Verify Email with OTP' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid OTP or email' })
  async verifyEmail(@Body() verifyEmailData: VerifyEmailDto) { 
    return this.authService.verifyEmail(verifyEmailData);
  }

  // POST /auth/resend-otp - Resend OTP for email verification
  @Post('resend-otp')
  @Public() 
  @ApiOperation({ summary: 'Resend OTP for Email Verification' })
  @ApiResponse({ status: 200, description: 'OTP resent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid email' })
  async resendEmailOtp(@Body() userdata: LoginUserDto) {
    return this.authService.resendEmailOtp(userdata);
  }

  // POST /auth/login - Login an existing user
  @Post('login')
  @Public() 
  @ApiOperation({ summary: 'Login' })
  @ApiResponse({ status: 200, description: 'User logged in successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async login(@Body() userData: LoginUserDto) {
    return this.authService.login(userData);
  }
}
