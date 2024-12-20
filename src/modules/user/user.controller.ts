import { Controller, Get, Put, Body, UseGuards, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetUser } from 'src/common/decorators/getUser.decorator';
import { UpdateUserDto } from './dto/UpdateUserDto';
import { UserService } from './user.service';
import { Public } from 'src/common/decorators/public.decorator';


@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth() 
  async getProfile(@GetUser('role') role: string) {
  return { role };
  }

  @Get('name')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the name of the currently authenticated user' })
  @ApiResponse({ status: 200, description: 'The name of the currently authenticated user' })
  @ApiResponse({ status: 404, description: 'Name not found' })
  async getName(@GetUser('userId') userId: string) {
    return await this.userService.getName(userId);
  }

  @Get('instructor-name/:userId')
  @Public()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the name of the currently authenticated instructor' })
  @ApiResponse({ status: 200, description: 'The name of the currently authenticated instructor' })
  @ApiResponse({ status: 404, description: 'Name not found' })
  async getInstructorName(@Param('userId') userId: string) {
    return await this.userService.getInstructorName(userId);
  }

  
  
  @Put('my-profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Updates the profile of the currently authenticated user' })
  @ApiResponse({ status: 200, description: 'The profile of the currently authenticated user has been updated' })
  @ApiResponse({ status: 404, description: 'Error in data' })
  async updateUser(@GetUser('userId') userId: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateUser(userId, updateUserDto);
  };

  @Get('my-profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the profile of the currently authenticated user' })
  @ApiResponse({ status: 200, description: 'The profile of the currently authenticated user' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async getMyProfile(@GetUser('userId') userId: string) {
    return await this.userService.getMyProfile(userId);
  }


}
