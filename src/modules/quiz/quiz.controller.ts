import { Controller, Get, Post, Param, UseGuards, Body } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StudentGuard } from 'src/common/guards/student.guard';
import { ApiResponse, ApiOperation } from '@nestjs/swagger';
import { GetUser } from 'src/common/decorators/getUser.decorator';
import { SubmitQuizDto } from './dto/submit-quiz.dto';

@Controller()
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @UseGuards(JwtAuthGuard, StudentGuard)
  @Get('student/courses/:courseId/modules/:moduleId/quiz')
  @ApiOperation({ summary: 'Generate a module quiz for a student' })
  @ApiResponse({ status: 200, description: 'Quiz generated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid course or module ID' })
  async generateQuiz(
    @Param('courseId') courseId: string,
    @Param('moduleId') moduleId: string,
    @GetUser('userId') userId: string
  ) {
    return this.quizService.generateQuiz(courseId, moduleId, userId);
  }

  @UseGuards(JwtAuthGuard, StudentGuard)
  @Post(':courseId/modules/:moduleId/quiz')
  @ApiOperation({ summary: 'Submit a module quiz for a student' })
  @ApiResponse({ status: 200, description: 'Quiz submitted successfully' })
  @ApiResponse({ status: 400, description: 'Invalid course or module ID' })
  async submitQuiz(
    @Param('courseId') courseId: string,
    @Param('moduleId') moduleId: string,
    @Body() submitQuizDto: SubmitQuizDto,
    @GetUser('userId') userId: string
  ) {
    return this.quizService.submitQuiz(courseId, moduleId, submitQuizDto, userId);
  }

  @UseGuards(JwtAuthGuard, StudentGuard)
  @Get(':courseId/modules/:moduleId/quiz/:quizId/feedback')
  @ApiOperation({ summary: 'Get quiz feedback for a student' })
  @ApiResponse({ status: 200, description: 'Quiz feedback retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid course or module ID' })
  async getQuizFeedback(
    @Param('courseId') courseId: string,
    @Param('moduleId') moduleId: string,
    @Param('quizId') quizId: string,
    @GetUser('userId') userId: string
  ) {
    return this.quizService.getQuizFeedback(moduleId, userId, quizId);
  }
}
