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
@Controller('courses')
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

  // @Get('/:name')
  // @Public()
  // @ApiOperation({ summary: 'Retrieve courses by name' })
  // @ApiParam({
  //   name: 'name',
  //   description: 'The name of the course to search for (case-insensitive)',
  //   example: 'DB',
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: 'List of courses matching the name retrieved successfully.',
  //   schema: {
  //     example: [
  //       {
  //         _id: '648a1e9b9f4e2d1a1b2c3d4e',
  //         name: 'Database Fundamentals',
  //         instructor: 'Caroline',
  //         category: 'Programming',
  //         description: 'Learn the basics of database management',
  //         difficulty_level: 'Intermediate',
  //       },
  //     ],
  //   },
  // })
  // @ApiResponse({ status: 404, description: 'No courses found matching the name.' })
  // async getCoursesByName(@Param('name') name: string) {
  //   try {
  //     return await this.courseService.getCoursesByName(name);
  //   } catch (error) {
  //     throw new InternalServerErrorException(
  //       'Failed to retrieve courses: ' + error.message,
  //     );
  //   }
  // }

  // @Get('/:instructor')
  // @Public()
  // @ApiOperation({ summary: 'Retrieve courses by instructor' })
  // @ApiParam({
  //   name: 'instructor',
  //   description: 'The name of the instructor (case-insensitive)',
  //   example: 'Caroline',
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: 'List of courses taught by the instructor retrieved successfully.',
  //   schema: {
  //     example: [
  //       {
  //         _id: '648a1e9b9f4e2d1a1b2c3d4e',
  //         name: 'Advanced Algorithms',
  //         instructor: 'Caroline',
  //         category: 'Programming',
  //         description: 'Learn advanced algorithmic techniques',
  //         difficulty_level: 'Advanced',
  //       },
  //     ],
  //   },
  // })
  // @ApiResponse({ status: 404, description: 'No courses found for the instructor.' })
  // async getCoursesByInstructor(@Param('instructor') instructor: string) {
  //   try {
  //     return await this.courseService.getCoursesByInstructor(instructor);
  //   } catch (error) {
  //     throw new InternalServerErrorException(
  //       'Failed to retrieve courses: ' + error.message,
  //     );
  //   }
  // }

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
}
