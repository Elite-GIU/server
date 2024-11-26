import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  InternalServerErrorException,
  Put,
  BadRequestException
} from '@nestjs/common';
import { CourseService } from './course.service';
import { JwtAuthGuard} from '../auth/jwt-auth.guard';
import { InstructorGuard } from 'src/common/guards/instructor.guard';
import { StudentGuard } from '../../common/guards/student.guard';
import { GetUser } from 'src/common/decorators/getUser.decorator';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { CreateCourseDto } from '../course/dto/CreateCourseDto';
import { UpdateCourseDto } from '../course/dto/UpdateCourseDto';
import mongoose from 'mongoose';

@ApiTags('Courses')
@Controller()
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

    @Get('instuctor/courses')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Retrieve all courses of logged in instructor' })
    @UseGuards(JwtAuthGuard, InstructorGuard)
    async getInstructorCourses(@GetUser('userId') userId: string){

        return await this.courseService.getInstructorCourse(userId);

    }

    @Post('instructor/courses')
    @UseGuards(JwtAuthGuard, InstructorGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a course under the logged in instructor' })
    async addInstructorCourse(@Body() createCourseDto: CreateCourseDto, @GetUser('userId') userId : string){
 
       try {

         return await this.courseService.addInstructorCourse(createCourseDto, userId);

       }catch(error){
    
        throw new InternalServerErrorException('Course creation failed : ' + error.message);

       }

    }

    @Put('instructor/courses/:id')
    @UseGuards(JwtAuthGuard, InstructorGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Instructor updates one of their courses' })
    async updateInstructorCourse(@Body() updateCourseDto : UpdateCourseDto, @Param('id') id: string, @GetUser('userId') userId: string){

        try {

            if(!mongoose.isValidObjectId(id))
              throw new BadRequestException('Wrong id');//I don't think this is for the user, it's for us.

            return await this.courseService.updateInstructorCourse(updateCourseDto, userId, id);

        }catch(error){

            throw new Error('Failed to update course: ' + error.message);
        }
    }

}
