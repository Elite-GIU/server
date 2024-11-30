import { Controller, Post, Get, Body, Param, UseGuards, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { InstructorService } from './instructor.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InstructorGuard } from '../../common/guards/instructor.guard';
import { AssignStudentDto } from './dto/AssignStudentDto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiParam, ApiBody } from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Get all available instructors' })
  @ApiResponse({
    status: 200,
    description: 'List of all instructors successfully retrieved.',
    schema: {
      example: [
        {
          _id: '648a1e9b9f4e2d1a1b2c3d4e',
          name: 'John Doe',
          email: 'john.doe@example.com',
          role: 'instructor',
        },
      ],
    },
  })
  @ApiResponse({ status: 404, description: 'No instructors found.' })
  async getAllInstructors() {
    return await this.instructorService.getAllInstructors();
  }


  @Get('/:name')
  @Public()
  @ApiOperation({ summary: 'Get instructors by name' })
  @ApiParam({
    name: 'name',
    description: 'The name of the instructor to search for (case-insensitive)',
    example: 'John',
  })
  @ApiResponse({
    status: 200,
    description: 'List of instructors matching the name successfully retrieved.',
    schema: {
      example: [
        {
          _id: '648a1e9b9f4e2d1a1b2c3d4e',
          name: 'John Doe',
          email: 'john.doe@example.com',
          role: 'instructor',
        },
      ],
    },
  })
  @ApiResponse({ status: 404, description: 'No instructors found matching the name.' })
  async getInstructorsByName(@Param('name') name: string) {
    if (!name) {
      throw new BadRequestException('Name parameter is required');
    }
    return await this.instructorService.getInstructorsByName(name);
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
