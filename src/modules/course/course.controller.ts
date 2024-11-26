import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  InternalServerErrorException,
} from '@nestjs/common';
import { CourseService } from './course.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StudentGuard } from '../../common/guards/student.guard';
import { GetUser } from 'src/common/decorators/getUser.decorator';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('Courses')
@Controller('course')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Retrieve all courses for the landing page' })
  @ApiResponse({
    status: 200,
    description: 'List of all available courses retrieved successfully.',
    schema: {
      example: [
        {
          _id: '648a1e9b9f4e2d1a1b2c3d4e',
          category: 'Programming',
          description: 'Learn Python programming from scratch',
          difficulty_level: 'Beginner',
        },
      ],
    },
  })
  @ApiResponse({ status: 404, description: 'No courses available.' })
  async getAllCourses() {
    return await this.courseService.getAllCourses();
  }


  @Post(':id/assign')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, StudentGuard)
  @ApiOperation({ summary: 'Assign the authenticated student to a course' })
  @ApiResponse({
    status: 201,
    description: 'Student successfully assigned to the course.',
    schema: {
      example: {
        _id: '648a1e9b9f4e2d1a1b2c3d4e',
        user_id: '647a1e9b9f4e2d1a1b2c3d4e',
        course_id: '648a1e9b9f4e2d1a1b2c3d4e',
        completion_percentage: 0,
        last_accessed: [],
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Student is already assigned to this course.' })
  @ApiResponse({ status: 404, description: 'Course not found.' })
  async assignStudentToCourse(
    @Param('id') courseId: string,
    @GetUser('userId') studentId: string,
  ) {
    try {
      return await this.courseService.assignStudentToCourse(courseId, studentId);
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to assign student to course: ' + error.message,
      );
    }
  }

  @Get('student/courses')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, StudentGuard)
  @ApiOperation({ summary: 'Get all courses for the authenticated student' })
  @ApiResponse({
    status: 200,
    description: 'List of courses for the student retrieved successfully.',
  })
  @ApiResponse({ status: 404, description: 'No courses found for this student.' })
  getStudentCourses(@GetUser('userId') userId: string) {
    return this.courseService.getStudentCourses(userId);
  }

  @Get('student/courses/:courseId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, StudentGuard) 
  @ApiOperation({ summary: 'Get course details with modules for the authenticated student' })
  @ApiResponse({
    status: 200,
    description: 'Course details with modules retrieved successfully.',
  })
  @ApiResponse({ status: 404, description: 'Course not found for this student.' })
  getStudentCourseById(
    @GetUser('userId') userId: string,
    @Param('courseId') courseId: string,
  ) {
    return this.courseService.getStudentCourseWithModules(userId, courseId);
  }

  @Get('student/courses/status/:status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, StudentGuard)
  @ApiOperation({ summary: 'Get student courses filtered by status' })
  @ApiResponse({
    status: 200,
    description: 'List of student courses by status retrieved successfully.',
  })
  @ApiResponse({ status: 404, description: 'No courses found with the specified status.' })
  getStudentCoursesByStatus(@GetUser('userId') userId: string, @Param('status') status: string) {
    return this.courseService.getStudentCoursesByStatus(userId, status);
  }
}
