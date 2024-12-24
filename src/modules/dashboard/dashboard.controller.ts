import { Controller, Get, Param, Query, Res, UseGuards, UsePipes } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InstructorGuard } from '../../common/guards/instructor.guard';
import { StudentGuard } from '../../common/guards/student.guard';
import { GetUser } from '../../common/decorators/getUser.decorator';
import { Response } from 'express';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
    ApiQuery
  } from '@nestjs/swagger';
import { ExistParam } from '../../common/decorators/existParam.decorator';
import { CheckExistValidatorPipe } from '../../common/pipes/check-exist-validator.pipe';
import { AssignedParam } from '../../common/decorators/assignedParam.decorator';
import { CheckAssignedValidatorPipe } from '../../common/pipes/check-assigned-validator.pipe';

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
  @Get('instructor/analytics')
  @ApiOperation({ summary: 'Get the instructor main page in dashboard' })
  @ApiResponse({ status: 200, description: 'Dashboard returned successfully' })
  async getInstructorMetrics(@GetUser('userId') instructorId: string) {
    return this.dashboardService.getInstructorMetrics(instructorId);
  }

  @UseGuards(JwtAuthGuard, InstructorGuard)
  @Get('instructor/download')
  @ApiOperation({ summary: 'Get the instructor dashboard' })
  @ApiResponse({ status: 200, description: 'Dashboard returned successfully' })
  async getInstructorDashboardReport(@GetUser('userId') instructorId: string, @Res() res: Response) {
    try {
      // Generate and send the Excel file
      await this.dashboardService.getInstructorDashboardReport(instructorId, res);
    } catch (error) {
      res.status(500).send('Failed to generate the file');
    }
  }

  @UseGuards(JwtAuthGuard, InstructorGuard)
  @Get('instructor/course/:id')
  @ApiOperation({ summary: 'Get the instructors course' })
  @ApiResponse({ status: 200, description: 'Course returned successfully' })
  @ApiParam({ name: 'id', required: true, description: 'Course ID' })
  async getInstructorCourseDashboard (
    @AssignedParam({
      modelName: 'Course', 
      firstAttrName: 'instructor_id', 
      secondAttrName: '_id', 
      firstKey: 'userId', 
      secondKey: 'id',
    }, CheckAssignedValidatorPipe) course: { _id: string} 
  ){
    return this.dashboardService.getInstructorCourseDashboard(course._id);
  }

  @UseGuards(JwtAuthGuard, InstructorGuard)
  @Get('instructor/course/:id/students')
  @ApiOperation({ summary: 'Get the students on an instructors course' })
  @ApiResponse({ status: 200, description: 'Students returned successfully' })
  @ApiParam({ name: 'id', required: true, description: 'Course ID' })
  @ApiQuery({ name: 'name', required: false, description: 'Search for students by name' })
  @ApiQuery({ name: 'page', required: false, description: 'Get page number'})
  @ApiQuery({ name: 'limit', required: false, description: 'Set page limit'})
  async getInstructorCourseStudents(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('name') name: string,
    @AssignedParam({
      modelName: 'Course', 
      firstAttrName: 'instructor_id', 
      secondAttrName: '_id', 
      firstKey: 'userId', 
      secondKey: 'id',
    }, CheckAssignedValidatorPipe) course: { _id: string}
  ) {
    return this.dashboardService.getInstructorCourseStudents(course._id, page, limit, name);
  }
}

