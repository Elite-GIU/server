import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiOkResponse,
  ApiBody
} from '@nestjs/swagger';
import { RegisterUserDto } from './dto/RegisterUserDto';
import { LoginUserDto } from './dto/LoginUserDto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // POST /auth/register - Register a new user
  @Post('register')
  @ApiOperation({ summary: 'Register' })
  @ApiResponse({ status: 201, description: 'Account created successfully' })
  @ApiResponse({ status: 400, description: 'Data entered is incorrect' })
  async register(@Body() userData: RegisterUserDto) {
    return this.authService.register(userData);
  }

  // POST /auth/login - Login an existing user and get JWT
  @Post('login')
  @ApiOperation({ summary: 'Login' })
  @ApiResponse({ status: 201, description: 'User logged in successfully' })
  @ApiResponse({ status: 400, description: 'Data entered is incorrect' })
  async login(@Body() userData: LoginUserDto) {
    return this.authService.login(userData);
  }
}
