import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { GetUser } from 'src/common/decorators/getUser.decorator';


@Controller('users')
export class UserController {
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth() 
  async getProfile(@GetUser('role') role: string) {
  return { role };
  }
}
