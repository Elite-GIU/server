import { Controller, Get, Delete, UseGuards, Res, NotFoundException, StreamableFile, Param, Query } from '@nestjs/common';
import { StudentService } from './student.service';
import { GetUser } from 'src/common/decorators/getUser.decorator';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StudentGuard } from 'src/common/guards/student.guard';
import { ApiTags } from '@nestjs/swagger';
import { CheckExistValidatorPipe } from 'src/common/pipes/check-exist-validator.pipe';
import { ExistParam } from 'src/common/decorators/existParam.decorator';
import { AdminGuard } from 'src/common/guards/admin.guard';

@Controller()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('Students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get('student/learning-path')
  @UseGuards(StudentGuard)
  @ApiOperation({ summary: 'Get learning path for the authenticated student' })
  @ApiResponse({
    status: 200,
    description: 'Learning path retrieved successfully.',
  })
  @ApiResponse({ status: 404, description: 'No learning path found for this student.' })
  getLearningPath(@GetUser('userId') userId: string) {
    return this.studentService.getLearningPath(userId);
  }

  
  @Delete('student')
  @UseGuards(StudentGuard)
  @ApiOperation({ summary: 'Delete the authenticated student' })
  @ApiResponse({
    status: 200,
    description: 'Student deleted successfully.',
  })
  @ApiResponse({ status: 404, description: 'Student not found.' })
  deleteStudentSelf(@GetUser('userId') userId: string) {
    return this.studentService.deleteStudent(userId);
  }

  @Delete('student/:id')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Admin delete student' })
  @ApiResponse({ status: 200,description: 'Student deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Student not found.' })
  @ApiParam({ name: 'id', required: true, description: 'User ID' })
  deleteStudent(
    @ExistParam({ idKey: 'id', modelName: 'User' }, CheckExistValidatorPipe) user: { id: string, modelName: string },
    @GetUser('userId') userId: string) {
    return this.studentService.deleteStudent(user.id);
  }

    @Get('admin/students')
    @UseGuards(AdminGuard)
    @ApiOperation({ summary: 'Admin: Retrieve all students or search by name' })
    @ApiQuery({
      name: 'name',
      required: false,
      description: 'The name of the student',
      example: 'Sarah',
    })
    @ApiQuery({ name: 'page', required: false, description: 'Get page number' })
    @ApiQuery({ name: 'limit', required: false, description: 'Set page limit' })
    @ApiResponse({
      status: 200,
      description: 'List of students successfully retrieved. with pagination details',
    })
    @ApiResponse({ status: 404, description: 'No students found.' })
    async getAllCoursesAdmin(
      @Query('page') page = 1,
      @Query('limit') limit = 10,
      @Query('name') name: string,
    ) {
      return await this.studentService.getAllStudents(page, limit, name);
    }
}