import { Controller, Post, Get, Body, Param, UseGuards, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { InstructorService } from './instructor.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InstructorGuard } from '../../common/guards/instructor.guard';
import { AssignStudentDto } from './dto/AssignStudentDto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';


@ApiTags('Instructor')
@Controller('instructor')
export class InstructorController {
  constructor(private readonly instructorService: InstructorService) {}

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
  async assignStudentToCourse(@Body() assignStudentDto: AssignStudentDto) {
    try {
      const { studentIdentifier, courseId } = assignStudentDto;
      return await this.instructorService.assignStudentToCourse(studentIdentifier, courseId);
    } catch (error) {
      throw new InternalServerErrorException('Failed to assign student: ' + error.message);
    }
  }
}
