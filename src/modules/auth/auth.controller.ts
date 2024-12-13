import { Controller, Post, Body, Put, Res, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { RegisterUserDto } from './dto/RegisterUserDto';
import { LoginUserDto } from './dto/LoginUserDto';
import { VerifyEmailDto } from './dto/VerifyEmailDto';
import { WebAuthnDto } from './dto/webauthn.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { AuthenticationResponseJSON, RegistrationResponseJSON } from '@simplewebauthn/server';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Public() 
  @ApiOperation({ summary: 'Register' })
  @ApiResponse({ status: 201, description: 'Account created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async register(@Body() userData: RegisterUserDto) {
    return this.authService.register(userData);
  }

  @Put('verify-email')
  @Public() 
  @ApiOperation({ summary: 'Verify Email with OTP' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid OTP or email' })
  async verifyEmail(@Body() verifyEmailData: VerifyEmailDto) { 
    return this.authService.verifyEmail(verifyEmailData);
  }

  @Post('resend-otp')
  @Public() 
  @ApiOperation({ summary: 'Resend OTP for Email Verification' })
  @ApiResponse({ status: 200, description: 'OTP resent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid email' })
  async resendEmailOtp(@Body() userdata: LoginUserDto) {
    return this.authService.resendEmailOtp(userdata);
  }

  @Post('login')
  @Public() 
  @ApiOperation({ summary: 'Login' })
  @ApiResponse({ status: 200, description: 'User logged in successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async login(@Body() userData: LoginUserDto, @Res() response: Response) {
    return this.authService.login(userData, response);
  }

  @Post('check-biometric-auth')
  @Public()
  @ApiOperation({ summary: 'Check Biometric Authentication' })
  @ApiResponse({ status: 200, description: 'Biometric authentication status returned' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  async checkBiometricAuth(@Body() webAuthnDto: WebAuthnDto) {   
    return { isRegistered: await this.authService.checkBiometricAuth(webAuthnDto.email, webAuthnDto.browserFingerprint) };
  }

  @Post('/register-webauthn')
  @ApiOperation({ summary: 'Register for WebAuthn using Email and Browser Fingerprint' })
  @ApiResponse({ status: 200, description: 'WebAuthn registration options generated' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBody({ type: WebAuthnDto })
  @Public()
  async registerWebAuthn(@Body() webAuthnDto: WebAuthnDto) {
    return { options: await this.authService.generateRegistrationOptions(webAuthnDto.email, webAuthnDto.browserFingerprint) };
  }

  @Post('/verify-registration')
  @ApiOperation({ summary: 'Verify WebAuthn registration' })
  @ApiResponse({ status: 200, description: 'Registration verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid registration data' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBody({ schema: { type: 'object', properties: {
      email: { type: 'string', format: 'email', required: ['email'] },
      browserFingerprint: { type: 'string', required: ['browserFingerprint'] },
      response: { type: 'object', required: ['response'], description: 'WebAuthn response data' }
    }}})
  @Public()
  async verifyRegistration(
    @Body() body: RegistrationResponseJSON & { email: string, browserFingerprint: string },
    @Res() res: Response
  ) {
    await this.authService.verifyRegistration(body, res);
  }

  @Post('generate-authentication-options')
  @Public()
  @ApiOperation({ summary: 'Generate WebAuthn authentication options' })
  @ApiResponse({ status: 200, description: 'WebAuthn authentication options generated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid user ID' })
  async generateAuthenticationOptions(@Body() body: { email: string }) {
    return { options: await this.authService.generateAuthenticationOptions(body.email) };
  }

  @Post('verify-authentication')
  @Public()
  @ApiOperation({ summary: 'Verify WebAuthn authentication' })
  @ApiResponse({ status: 200, description: 'WebAuthn authentication verified successfully' })
  @ApiResponse({ status: 400, description: 'Failed to verify WebAuthn authentication' })
  async verifyAuthentication(@Body() body: AuthenticationResponseJSON & { email: string }, @Res() response: Response) {
    await this.authService.verifyAuthentication(body, response);
  }
}
