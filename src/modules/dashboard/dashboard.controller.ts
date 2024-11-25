import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InstructorGuard } from 'src/common/guards/instructor.guard';
import { StudentGuard } from 'src/common/guards/student.guard';
import { GetUser } from 'src/common/decorators/getUser.decorator';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth
  } from '@nestjs/swagger';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @UseGuards(JwtAuthGuard, StudentGuard)
  @Get('student')
  @ApiOperation({ summary: 'Get the student dashboard' })
  @ApiResponse({ status: 200, description: 'Dashboard returned successfully' })
  async getStudentDashboard(@GetUser('userId') userId: string) {
    return await this.dashboardService.getStudentDashboard(userId);
  }

  @UseGuards(JwtAuthGuard, StudentGuard)
  @Get('student/quiz')
  @ApiOperation({ summary: 'Get the student quizzes' })
  @ApiResponse({ status: 200, description: 'Quizzes returned successfully' })
  async getStudentQuizzes(@GetUser('userId') userId: string) {
    return this.dashboardService.getStudentQuizzes(userId);
  }

  @UseGuards(JwtAuthGuard, InstructorGuard)
  @Get('instructor')
  @ApiOperation({ summary: 'Get the instructor dashboard' })
  @ApiResponse({ status: 200, description: 'Dashboard returned successfully' })
  async getInstructorDashboard(@GetUser('userId') instructorId: string) {
    return this.dashboardService.getInstructorDashboard(instructorId);
  }

  @UseGuards(JwtAuthGuard, InstructorGuard)
  @Get('instructor/course/:id')
  @ApiOperation({ summary: 'Get the instructors course' })
  @ApiResponse({ status: 200, description: 'Course returned successfully' })
  async getInstructorCourseDashboard(@Param('id') courseId: string) {
    return this.dashboardService.getInstructorCourseDashboard(courseId);
  }

  @UseGuards(JwtAuthGuard, InstructorGuard)
  @Get('instructor/course/:id/students')
  @ApiOperation({ summary: 'Get the students on an instructors course' })
  @ApiResponse({ status: 200, description: 'Students returned successfully' })
  async getInstructorCourseStudents(
    @Param('id') courseId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.dashboardService.getInstructorCourseStudents(courseId, page, limit);
  }
}

