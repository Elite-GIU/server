import { Controller, Post, Get, Put, Delete, Param, Body } from '@nestjs/common';
import { QuestionService } from './question.service'; 
import { CreateQuestionDto } from './dto/CreateQuestionDto';
import { UpdateQuestionDto } from './dto/UpdateQuestionDto';
import { JwtAuthGuard } from 'src/modules/auth/jwt-auth.guard';
import { InstructorGuard } from 'src/common/guards/instructor.guard';
import { ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';

@Controller('question')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Post(':courseId/modules/:moduleId/questionbank')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, InstructorGuard)
  @ApiOperation({ summary: 'Create a new question in the module\'s question bank' })
  @ApiResponse({ status: 201, description: 'Question created successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 404, description: 'Module or question bank not found.' })
  async createQuestion(
    @Param('courseId') courseId: string,
    @Param('moduleId') moduleId: string,
    @Body() createQuestionDto: CreateQuestionDto,
  ) {
    return await this.questionService.createQuestion(courseId, moduleId, createQuestionDto);
  }

  @Get(':courseId/modules/:moduleId/questionbank')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, InstructorGuard)
  @ApiOperation({ summary: 'Get all questions in the module\'s question bank' })
  @ApiResponse({ status: 200, description: 'Questions retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Module or question bank not found.' })
  async getQuestionbank(
    @Param('courseId') courseId: string,
    @Param('moduleId') moduleId: string,
  ) {
    return await this.questionService.getQuestionbank(courseId, moduleId);
  }

  @Put(':courseId/modules/:moduleId/question/:questionId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, InstructorGuard)
  @ApiOperation({ summary: 'Update a specific question' })
  @ApiResponse({ status: 200, description: 'Question updated successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 404, description: 'Question not found.' })
  async updateQuestion(
    @Param('courseId') courseId: string,
    @Param('moduleId') moduleId: string,
    @Param('questionId') questionId: string,
    @Body() updateQuestionDto: UpdateQuestionDto,
  ) {
    return await this.questionService.updateQuestion(courseId, moduleId, questionId, updateQuestionDto);
  }

  @Delete(':courseId/modules/:moduleId/question/:questionId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, InstructorGuard)
  @ApiOperation({ summary: 'Delete a specific question' })
  @ApiResponse({ status: 200, description: 'Question deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Question not found.' })
  async deleteQuestion(
    @Param('courseId') courseId: string,
    @Param('moduleId') moduleId: string,
    @Param('questionId') questionId: string,
  ) {
    return await this.questionService.deleteQuestion(courseId, moduleId, questionId);
  }
}
