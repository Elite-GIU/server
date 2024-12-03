import { Controller, Post, Get, Body, Param, UseGuards, InternalServerErrorException, BadRequestException, Query } from '@nestjs/common';
import { InstructorService } from './instructor.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InstructorGuard } from '../../common/guards/instructor.guard';
import { AssignStudentDto } from './dto/AssignStudentDto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { CourseService } from '../course/course.service';
import { AssignedParam } from 'src/common/decorators/assignedParam.decorator';
import { CheckAssignedValidatorPipe } from 'src/common/pipes/check-assigned-validator.pipe';
import { GetUser } from 'src/common/decorators/getUser.decorator';


@ApiTags('Instructor')
@Controller('instructor')
export class InstructorController {
  constructor(private readonly instructorService: InstructorService, private readonly courseService: CourseService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all available instructors or search by name' })
  @ApiQuery({
    name: 'name',
    required: false,
    description: 'The name of the instructor to search for (case-insensitive)',
    example: 'John',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Get page number'})
  @ApiQuery({ name: 'limit', required: false, description: 'Set page limit'})
  @ApiResponse({
    status: 200,
    description: 'List of instructors successfully retrieved.',
    schema: {
      example: [
        {
          name: 'John Doe',
          email: 'john.doe@example.com',
          preferences: ['Python', 'Java'],
        },
      ],
    },
  })
  @ApiResponse({ status: 404, description: 'No instructors found.' })
  async getInstructors(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('name') name: string,
  ) {
    return await this.instructorService.getInstructors(page, limit, name);
  }

  @Post('assign')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, InstructorGuard)
  @ApiOperation({ summary: 'Assign a student to a course' })
  @ApiResponse({ status: 201, description: 'Student successfully assigned to the course.' })
  @ApiResponse({ status: 400, description: 'Invalid data or assignment failed.' })
  async assignStudentToCourse( 
    @Body() assignStudentDto: AssignStudentDto,
    @AssignedParam(
      {
        modelName: 'Course',
        firstAttrName: 'instructor_id',
        secondAttrName: '_id',
        firstKey: 'userId',
        secondKey: 'courseId',
      },
      CheckAssignedValidatorPipe,
    )
    course: { _id: string },
  ) {
    const { studentIdentifier } = assignStudentDto;
    return await this.courseService.assignStudentToCourse(course._id, studentIdentifier);
  }
  
}
