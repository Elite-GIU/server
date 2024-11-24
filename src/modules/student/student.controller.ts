import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { StudentService } from './student.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('student')
@UseGuards(AuthGuard())
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get('learning-path')
  getLearningPath(@GetUser('_id') userId: string) {
    return this.studentService.getLearningPath(userId);
  }

  @Get('courses')
  getStudentCourses(@GetUser('_id') userId: string) {
    return this.studentService.getStudentCourses(userId);
  }

  @Get('courses/:courseId')
  getStudentCourseById(
    @GetUser('_id') userId: string,
    @Param('courseId') courseId: string,
  ) {
    return this.studentService.getStudentCourseWithModules(userId, courseId);
  }

  @Get('courses/:courseId/modules/:moduleId')
  getModuleContent(
    @GetUser('_id') userId: string,
    @Param('courseId') courseId: string,
    @Param('moduleId') moduleId: string,
  ) {
    return this.studentService.getModuleContent(userId, courseId, moduleId);
  }
}
