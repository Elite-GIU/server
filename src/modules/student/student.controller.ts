import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { StudentService } from './student.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('student')
@UseGuards(AuthGuard())
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get('student/learning-path')
  getLearningPath(@GetUser('user_id') userId: string) {
    return this.studentService.getLearningPath(userId);
  }
}
