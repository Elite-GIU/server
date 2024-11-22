import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserService } from '../user/user.service';
import { RegisterUserDto } from './dto/RegisterUserDto';
import { LoginUserDto } from './dto/LoginUserDto';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  private readonly BASE_URL = process.env.BASE_URL || '';
  private readonly API_PREFIX = process.env.API_PREFIX || '';
  private readonly SECRET_PASSWORD = process.env.SECRET_PASSWORD || '';

  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {
    this.validateEnvironment();
  }

  // Validate required environment variables
  private validateEnvironment() {
    if (!this.BASE_URL || !this.API_PREFIX || !this.SECRET_PASSWORD) {
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
      const emailVerificationToken = uuidv4();

      const user = await this.userService.create({
        email,
        password: hashedPassword,
        name,
        role,
        preferences,
        emailVerificationToken,
      });

      await this.sendVerificationEmail(user.email, emailVerificationToken);

      return {
        statusCode: 201,
        message: 'Registration successful! Please verify your email to activate your account.',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error; // Preserve specific HTTP exceptions
      }
      throw new InternalServerErrorException({
        statusCode: 500,
        errorCode: 'REGISTRATION_ERROR',
        message: 'An error occurred while registering the user. Please try again later.',
      });
    }
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

  // Send verification email
  private async sendVerificationEmail(email: string, token: string) {
    const verificationUrl = `${this.BASE_URL}${this.API_PREFIX}/auth/verify-email?token=${token}`;
    const emailBody = {
      to: email,
      subject: 'Email Verification',
      text: `Please verify your email by clicking the link: ${verificationUrl}`,
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
        message: 'Failed to send the verification email. Please try again later.',
      });
    }
  }

  // Verify email
  async verifyEmail(token: string) {
    try {
      const user = await this.userService.findOneByToken(token);
      if (!user) {
        throw new NotFoundException({
          statusCode: 404,
          errorCode: 'TOKEN_INVALID',
          message: 'The verification token is invalid or has expired.',
        });
      }

      user.isEmailVerified = true;
      user.emailVerificationToken = null;
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
}