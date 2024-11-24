import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { CourseService } from './course.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('course')
@UseGuards(AuthGuard())
export class CourseController {
    constructor(private readonly courseService: CourseService) {}

    @Get('student/courses')
    getStudentCourses(@GetUser('user_id') userId: string) {
      return this.courseService.getStudentCourses(userId);
    }
  
    @Get('student/courses/:courseId')
    getStudentCourseById(
      @GetUser('user_id') userId: string,
      @Param('courseId') courseId: string,
    ) {
      return this.courseService.getStudentCourseWithModules(userId, courseId);
    }
}
