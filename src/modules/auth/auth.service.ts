import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserService } from '../user/user.service';
import { RegisterUserDto } from './dto/RegisterUserDto';
import { LoginUserDto } from './dto/LoginUserDto';
import { VerifyEmailDto } from './dto/VerifyEmailDto';
import { randomInt } from 'crypto';
import axios from 'axios';

@Injectable()
export class AuthService {
  private readonly BASE_URL = process.env.BASE_URL || '';
  private readonly SECRET_PASSWORD = process.env.SECRET_PASSWORD || '';

  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {
    this.validateEnvironment();
  }

  // Validate required environment variables
  private validateEnvironment() {
    if (!this.BASE_URL || !this.SECRET_PASSWORD) {
      throw new InternalServerErrorException({
        statusCode: 500,
        errorCode: 'CONFIGURATION_ERROR',
        message: 'Environment variables are not properly configured.',
      });
    }
  }

  // Register a new user
  async register(userData: RegisterUserDto) {
    const { email, password, name, role, preferences } = userData;

    try {
      await this.validateUserUniqueness(email);

      const hashedPassword = await bcrypt.hash(password, 10);
      const otp = this.generateOtp();

      const user = await this.userService.create({
        email,
        password: hashedPassword,
        name,
        role,
        preferences,
        emailVerificationOtp: otp,
        emailVerificationOtpCreatedAt: new Date(),
        emailVerificationOtpExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
      });

      await this.sendOtpEmail(user.email, otp);

      return {
        statusCode: 201,
        message: 'Registration successful! Please verify your email using the OTP sent to your email.',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException({
        statusCode: 500,
        errorCode: 'REGISTRATION_ERROR',
        message: 'An error occurred while registering the user. Please try again later.',
      });
    }
  }

  // Generate a 6-digit OTP
  private generateOtp(): string {
    return randomInt(100000, 999999).toString();
  }

  // Send OTP via email
  private async sendOtpEmail(email: string, otp: string) {
    const emailBody = {
      to: email,
      subject: 'Email Verification OTP',
      text: `Your OTP for email verification is: ${otp}. It is valid for 5 minutes.`,
    };

    const headers = {
      Authorization: `Bearer ${this.SECRET_PASSWORD}`,
      'Content-Type': 'application/json',
    };

    try {
      await axios.post(`http://email-sender-orcin-mu.vercel.app/send-email`, emailBody, { headers });
    } catch (error) {
      throw new InternalServerErrorException({
        statusCode: 500,
        errorCode: 'EMAIL_SEND_ERROR',
        message: 'Failed to send the OTP email. Please try again later.',
      });
    }
  }

  // Verify OTP for email verification
  async verifyEmail(verifyEmailData: VerifyEmailDto) {
    const { email, otp } = verifyEmailData;
    try {
      const user = await this.userService.findByEmail(email);

      if (!user || !user.emailVerificationOtp || user.emailVerificationOtp !== otp) {
        throw new UnauthorizedException({
          statusCode: 401,
          errorCode: 'INVALID_OTP',
          message: 'The OTP is invalid or has expired.',
        });
      }

      if (user.emailVerificationOtpExpiresAt && new Date() > user.emailVerificationOtpExpiresAt) {
        throw new UnauthorizedException({
          statusCode: 401,
          errorCode: 'OTP_EXPIRED',
          message: 'The OTP has expired. Please request a new one.',
        });
      }

      user.isEmailVerified = true;
      user.emailVerificationOtp = null;
      user.emailVerificationOtpCreatedAt = null;
      user.emailVerificationOtpExpiresAt = null;
      await user.save();

      return {
        statusCode: 200,
        message: 'Email verified successfully. You can now log in.',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException({
        statusCode: 500,
        errorCode: 'EMAIL_VERIFICATION_ERROR',
        message: 'An error occurred during email verification. Please try again later.',
      });
    }
  }

  // Resend OTP for email verification
  async resendEmailOtp(userData: LoginUserDto) {
    try {
      const { email, password } = userData;
      const user = await this.userService.findByEmail(email);

      if (!user) {
        throw new UnauthorizedException({
          statusCode: 401,
          errorCode: 'USER_NOT_FOUND',
          message: 'User not found.',
        });
      }

      // Ensure the email is not already verified
      if (user.isEmailVerified) {
        throw new BadRequestException({
          statusCode: 400,
          errorCode: 'EMAIL_ALREADY_VERIFIED',
          message: 'Email is already verified.',
        });
      }

      // Ensure the password is correct
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException({
          statusCode: 401,
          errorCode: 'INVALID_PASSWORD',
          message: 'Incorrect password.',
        });
      }

      const currentTime = new Date().getTime();
      const otpCreatedAt = new Date(user.emailVerificationOtpCreatedAt).getTime();
      const otpTimeout = 60000; // 1 minute
     
      // Check if 1 minute has passed after OTP expiry
      if (user.emailVerificationOtpExpiresAt && currentTime < otpCreatedAt + otpTimeout) {
        throw new BadRequestException({
          statusCode: 400,
          errorCode: 'OTP_TOO_SOON',
          message: 'You can only request a new OTP after 1 minute.',
        });
      }
      
      
      // Generate and send new OTP
      const newOtp = this.generateOtp();
      user.emailVerificationOtp = newOtp;
      user.emailVerificationOtpCreatedAt = new Date();
      user.emailVerificationOtpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

      await user.save();

      await this.sendOtpEmail(user.email, newOtp);

      return {
        statusCode: 200,
        message: 'OTP resent successfully. Please check your email.',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException({
        statusCode: 500,
        errorCode: 'RESEND_OTP_ERROR',
        message: 'An error occurred while resending the OTP. Please try again later.',
      });
    }
  }

  // Log in a user
  async login(userData: LoginUserDto) {
    const { email, password } = userData;

    try {
      const user = await this.userService.findByEmail(email);
      this.validateUserForLogin(user);

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new UnauthorizedException({
          statusCode: 401,
          errorCode: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password.',
        });
      }

      return {
        statusCode: 200,
        message: 'Login successful.',
        data: this.generateJwt(user),
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException({
        statusCode: 500,
        errorCode: 'LOGIN_ERROR',
        message: 'An error occurred during login. Please try again later.',
      });
    }
  }

  // Validate user for login
  private validateUserForLogin(user: any) {
    if (!user) {
      throw new UnauthorizedException({
        statusCode: 401,
        errorCode: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password.',
      });
    }
    if (!user.isEmailVerified) {
      throw new UnauthorizedException({
        statusCode: 401,
        errorCode: 'EMAIL_NOT_VERIFIED',
        message: 'Please verify your email before logging in.',
      });
    }
  }

  // Generate a JWT token
  private generateJwt(user: any) {
    const payload = { userId: user._id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload, {
        expiresIn: '1h',
      }),
    };
  }

  // Verify user uniqueness by email
  private async validateUserUniqueness(email: string) {
    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException({
        statusCode: 400,
        errorCode: 'USER_ALREADY_EXISTS',
        message: 'The email is already registered. Please use a different email.',
      });
    }
  }
}
