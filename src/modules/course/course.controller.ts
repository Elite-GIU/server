import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  InternalServerErrorException,
  Put,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { CourseService } from './course.service';
import { JwtAuthGuard} from '../auth/jwt-auth.guard';
import { InstructorGuard } from 'src/common/guards/instructor.guard';
import { StudentGuard } from '../../common/guards/student.guard';
import { GetUser } from 'src/common/decorators/getUser.decorator';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { CreateCourseDto } from '../course/dto/CreateCourseDto';
import { UpdateCourseDto } from '../course/dto/UpdateCourseDto';
import { CheckExistValidatorPipe } from 'src/common/pipes/check-exist-validator.pipe';
import { ExistParam } from 'src/common/decorators/existParam.decorator';
import { AssignedParam } from 'src/common/decorators/assignedParam.decorator';
import { CheckAssignedValidatorPipe } from 'src/common/pipes/check-assigned-validator.pipe';

@ApiTags('Courses')
@Controller()
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get('/courses')
  @Public()
  @ApiOperation({ summary: 'Retrieve all courses or search by name or instructor name' })
  @ApiQuery({
    name: 'name',
    required: false,
    description: 'The name of the course to search for (case-insensitive)',
    example: 'Python',
  })
  @ApiQuery({
    name: 'instructorName',
    required: false,
    description: 'The name of the instructor to search for (case-insensitive)',
    example: 'John Doe',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Get page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Set page limit' })
  @ApiResponse({
    status: 200,
    description: 'List of courses successfully retrieved.',
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
  @ApiResponse({ status: 404, description: 'No courses found.' })
  async getAllCourses(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('name') name: string,
    @Query('instructorName') instructorName: string,
  ) {
    return await this.courseService.getAllCourses(page, limit, name, instructorName);
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
    @ApiParam({ name: 'id', required: true, description: 'Course ID' })
    async updateInstructorCourse(
      @Body() updateCourseDto : UpdateCourseDto,
      @AssignedParam({
        modelName: 'Course', 
        firstAttrName: 'instructor_id', 
        secondAttrName: '_id', 
        firstKey: 'userId', 
        secondKey: 'id',
      }, CheckAssignedValidatorPipe) course : {instructor_id: string, _id: string}
    ) { 
        return await this.courseService.updateInstructorCourse(updateCourseDto, course.instructor_id, course._id);
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
  getStudentCourses(
    @GetUser('userId') userId: string
  ) {
    return this.courseService.getStudentCourses(userId);
  }

  @Get('student/courses/:id/modules')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, StudentGuard) 
  @ApiOperation({ summary: 'Get course details with modules for the authenticated student' })
  @ApiResponse({
    status: 200,
    description: 'Course details with modules retrieved successfully.',
  })
  @ApiResponse({ status: 404, description: 'Course not found for this student.' })
  @ApiParam({ name: 'id', required: true, description: 'Course ID' })
  getStudentCourseById(
    @AssignedParam({
      modelName: 'StudentCourse', 
      firstAttrName: 'user_id', 
      secondAttrName: 'course_id', 
      firstKey: 'userId', 
      secondKey: 'id',
    }, CheckAssignedValidatorPipe) {course_id}: {course_id: string}

  ) {
    return this.courseService.getStudentCourseWithModules(course_id);
  }

  @Post('student/courses/:id/assign')
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
  @ApiParam({ name: 'id', required: true, description: 'Course ID' })
  async assignStudentToCourse(
    @ExistParam({ idKey: 'id', modelName: 'Course' }, CheckExistValidatorPipe) course: { id: string, modelName: string },
    @GetUser('userId') studentId: string,
  ) {
    try {
      return await this.courseService.assignStudentToCourse(course.id, studentId);
    } catch (error) {
      throw new BadRequestException(
        'Failed to assign student to course: ' + error.message,
      );
    }
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

  @Delete('instructor/courses/:id')
  @UseGuards(JwtAuthGuard, InstructorGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a course under the logged in instructor' })
  @ApiParam({ name: 'id', required: true, description: 'Course ID' })
  async deleteInstructorCourse(@Param('id') id : string, @GetUser('userId') userId: string, @AssignedParam({
    modelName: 'Course', 
    firstAttrName: 'instructor_id', 
    secondAttrName: '_id', 
    firstKey: 'userId', 
    secondKey: 'id',
  }, CheckAssignedValidatorPipe) course : {instructor_id: string, _id: string}){
      
      return await this.courseService.deleteInstructorCourse(id, userId);   

  }
}
  
