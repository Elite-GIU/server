import { Controller, Post, Body, UseGuards, InternalServerErrorException } from '@nestjs/common';
import { InstructorService } from './instructor.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InstructorGuard } from '../../common/guards/instructor.guard';
import { AssignStudentDto } from './dto/AssignStudentDto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Instructor')
@ApiBearerAuth()
@Controller('instructor')
@UseGuards(JwtAuthGuard, InstructorGuard)
export class InstructorController {
  constructor(private readonly instructorService: InstructorService) {}

  @Post('assign')
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
