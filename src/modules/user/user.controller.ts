import { Controller, Get, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createUserDto: { name: string; email: string; password: string }) {
    return this.userService.createUser(createUserDto.name, createUserDto.email, createUserDto.password);
  }

  @Get()
  async findAll() {
    return this.userService.findAll();
  }
}
