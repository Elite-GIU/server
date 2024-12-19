import { Controller, Get, Delete, UseGuards, Res, NotFoundException, StreamableFile, Param } from '@nestjs/common';
import { StudentService } from './student.service';
import { GetUser } from 'src/common/decorators/getUser.decorator';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
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
}