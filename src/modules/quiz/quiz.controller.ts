import { Controller, Get, Post, Param, UseGuards, Body } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StudentGuard } from '../../common/guards/student.guard';
import { ApiResponse, ApiOperation, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { GetUser } from '../../common/decorators/getUser.decorator';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { AssignedParam } from '../../common/decorators/assignedParam.decorator';
import { CheckAssignedValidatorPipe } from '../../common/pipes/check-assigned-validator.pipe';

@Controller()
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @UseGuards(JwtAuthGuard, StudentGuard)
  @ApiBearerAuth()
  @Get('student/courses/:courseId/modules/:moduleId/quiz')
  @ApiOperation({ summary: 'Generate a module quiz for a student' })
  @ApiResponse({ status: 200, description: 'Quiz generated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid course or module ID' })
  @ApiParam({ name: 'courseId', type: String, description: 'The ID of the course' })
  @ApiParam({ name: 'moduleId', type: String, description: 'The ID of the module' })
  async generateQuiz(
    @AssignedParam({
        modelName: 'StudentCourse',
        firstAttrName: 'user_id',
        secondAttrName: 'course_id',
        firstKey: 'userId',
        secondKey: 'courseId'
    }, CheckAssignedValidatorPipe) studentCourse: { course_id: string },
    @AssignedParam({
        modelName: 'ModuleEntity',
        firstAttrName: 'course_id',
        secondAttrName: '_id',
        firstKey: 'courseId',
        secondKey: 'moduleId'
    }, CheckAssignedValidatorPipe) module: { _id: string },
    @GetUser('userId') userId: string
  ) {
    return this.quizService.generateQuiz(studentCourse.course_id, module._id, userId);
  }

  @UseGuards(JwtAuthGuard, StudentGuard)
  @ApiBearerAuth()
  @Post('student/courses/:courseId/modules/:moduleId/quiz/:quizId')
  @ApiOperation({ summary: 'Submit a module quiz for a student' })
  @ApiResponse({ status: 200, description: 'Quiz submitted successfully' })
  @ApiResponse({ status: 400, description: 'Invalid course or module ID' })
  @ApiParam({ name: 'courseId', type: String, description: 'The ID of the course' })
  @ApiParam({ name: 'moduleId', type: String, description: 'The ID of the module' })
  @ApiParam({ name: 'quizId', type: String, description: 'The ID of the quiz response' })
  async submitQuiz(
    @AssignedParam({
        modelName: 'StudentCourse',
        firstAttrName: 'user_id',
        secondAttrName: 'course_id',
        firstKey: 'userId',
        secondKey: 'courseId'
    }, CheckAssignedValidatorPipe) studentCourse: { course_id: string },
    @AssignedParam({
        modelName: 'ModuleEntity',
        firstAttrName: 'course_id',
        secondAttrName: '_id',
        firstKey: 'courseId',
        secondKey: 'moduleId'
    }, CheckAssignedValidatorPipe) module: { _id: string },
    @AssignedParam({
        modelName: 'QuizResponse',
        firstAttrName: 'module_id',
        secondAttrName: '_id',
        firstKey: 'moduleId',
        secondKey: 'quizId'
    }, CheckAssignedValidatorPipe) quizResponse: { _id: string },
    @Body() submitQuizDto: SubmitQuizDto,
    @GetUser('userId') userId: string
  ) {
    return this.quizService.submitQuiz(studentCourse.course_id, module._id, submitQuizDto, userId, quizResponse._id);
  }

  @UseGuards(JwtAuthGuard, StudentGuard)
  @ApiBearerAuth()
  @Get('student/quiz/:quizId/feedback')
  @ApiOperation({ summary: 'Get quiz feedback for a student' })
  @ApiResponse({ status: 200, description: 'Quiz feedback retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid course or module ID' })
  @ApiParam({ name: 'quizId', type: String, description: 'The ID of the quiz response' })
  async getQuizFeedback(
    @GetUser('userId') userId: string,
    @AssignedParam({
        modelName: 'QuizResponse',
        firstAttrName: 'user_id',
        secondAttrName: '_id',
        firstKey: 'userId',
        secondKey: 'quizId'
    }, CheckAssignedValidatorPipe) quizResponse: { _id: string },
  ) {
    return this.quizService.getQuizFeedback(quizResponse._id);
  }
}
