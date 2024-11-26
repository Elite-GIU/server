import { Controller, Get, UseGuards } from '@nestjs/common';
import { StudentService } from './student.service';
import { GetUser } from 'src/common/decorators/getUser.decorator';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StudentGuard } from 'src/common/guards/student.guard';
import { ApiTags } from '@nestjs/swagger';

@Controller('student')
@UseGuards(JwtAuthGuard, StudentGuard)
@ApiTags('Students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get('student/learning-path')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get learning path for the authenticated student' })
  @ApiResponse({
    status: 200,
    description: 'Learning path retrieved successfully.',
  })
  @ApiResponse({ status: 404, description: 'No learning path found for this student.' })
  getLearningPath(@GetUser('userId') userId: string) {
    return this.studentService.getLearningPath(userId);
  }
}
