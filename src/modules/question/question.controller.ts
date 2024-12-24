import { Controller, Post, Get, Put, Delete, Param, Body } from '@nestjs/common';
import { QuestionService } from './question.service'; 
import { CreateQuestionDto } from './dto/CreateQuestionDto';
import { UpdateQuestionDto } from './dto/UpdateQuestionDto';
import { JwtAuthGuard } from '../../modules/auth/jwt-auth.guard';
import { InstructorGuard } from '../../common/guards/instructor.guard';
import { ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { AssignedParam } from '../../common/decorators/assignedParam.decorator';
import { CheckAssignedValidatorPipe } from '../../common/pipes/check-assigned-validator.pipe';
import { ExistParam } from '../../common/decorators/existParam.decorator';
import { CheckExistValidatorPipe } from '../../common/pipes/check-exist-validator.pipe';

@Controller('question')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Get(':courseId/modules/:moduleId/questionbank')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, InstructorGuard)
  @ApiOperation({ summary: 'Get all questions in the module\'s question bank' })
  @ApiResponse({ status: 200, description: 'Questions retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Module or question bank not found.' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiParam({ name: 'moduleId', description: 'Module ID' })
  async getQuestionbank(
    @AssignedParam(
      {
        modelName: 'Course',
        firstAttrName: 'instructor_id',
        secondAttrName: '_id',
        firstKey: 'userId',
        secondKey: 'courseId',
      },
      CheckAssignedValidatorPipe,
    ) course: { _id: string },
    @AssignedParam(
      {
        modelName: 'ModuleEntity',
        firstAttrName: 'course_id',
        secondAttrName: '_id',
        firstKey: 'courseId',
        secondKey: 'moduleId',
      }, 
      CheckAssignedValidatorPipe,
    ) module: { _id: string },  
  ) {
    return await this.questionService.getQuestionbank(module._id);
  }

  @Post(':courseId/modules/:moduleId/questionbank')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, InstructorGuard)
  @ApiOperation({ summary: 'Create a new question in the module\'s question bank' })
  @ApiResponse({ status: 201, description: 'Question created successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 404, description: 'Module or question bank not found.' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiParam({ name: 'moduleId', description: 'Module ID' })
  async createQuestion(
    @Body() createQuestionDto: CreateQuestionDto,
    @AssignedParam(
      {
        modelName: 'Course',
        firstAttrName: 'instructor_id',
        secondAttrName: '_id',
        firstKey: 'userId',
        secondKey: 'courseId',
      },
      CheckAssignedValidatorPipe,
    ) course: { _id: string },
    @AssignedParam(
      {
        modelName: 'ModuleEntity',
        firstAttrName: 'course_id',
        secondAttrName: '_id',
        firstKey: 'courseId',
        secondKey: 'moduleId',
      },
      CheckAssignedValidatorPipe,
    ) module: { _id: string },
  ) {
    return await this.questionService.createQuestion(module._id, createQuestionDto);
  }


  @Put(':courseId/modules/:moduleId/question/:questionId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, InstructorGuard)
  @ApiOperation({ summary: 'Update a specific question' })
  @ApiResponse({ status: 200, description: 'Question updated successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 404, description: 'Question not found.' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiParam({ name: 'moduleId', description: 'Module ID' })
  @ApiParam({ name: 'questionId', description: 'Question ID' })
  async updateQuestion(
    @AssignedParam(
      {
        modelName: 'Course',
        firstAttrName: 'instructor_id',
        secondAttrName: '_id',
        firstKey: 'userId',
        secondKey: 'courseId',
      },
      CheckAssignedValidatorPipe,
    ) course: { _id: string },
    @AssignedParam(
      {
        modelName: 'ModuleEntity',
        firstAttrName: 'course_id',
        secondAttrName: '_id',
        firstKey: 'courseId',
        secondKey: 'moduleId',
      },
      CheckAssignedValidatorPipe,
    ) module: { _id: string },
    @ExistParam({idKey: 'questionId', modelName: 'Question' }, CheckExistValidatorPipe) question: { id: string },
    @Body() updateQuestionDto: UpdateQuestionDto,
  ) {
    return await this.questionService.updateQuestion(module._id, question.id , updateQuestionDto);
  }

  @Delete(':courseId/modules/:moduleId/question/:questionId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, InstructorGuard)
  @ApiOperation({ summary: 'Delete a specific question' })
  @ApiResponse({ status: 200, description: 'Question deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Question not found.' })
  @ApiParam({ name: 'courseId', description: 'Course ID' }) 
  @ApiParam({ name: 'moduleId', description: 'Module ID' })
  @ApiParam({ name: 'questionId', description: 'Question ID' })
  async deleteQuestion(
    @AssignedParam(
      {
        modelName: 'Course',
        firstAttrName: 'instructor_id',
        secondAttrName: '_id',
        firstKey: 'userId',
        secondKey: 'courseId',
      },
      CheckAssignedValidatorPipe,
    ) course: { _id: string },  
    @AssignedParam(
      {
        modelName: 'ModuleEntity',
        firstAttrName: 'course_id',
        secondAttrName: '_id',
        firstKey: 'courseId',
        secondKey: 'moduleId',
      },
      CheckAssignedValidatorPipe,
    ) module: { _id: string },
    @ExistParam({idKey: 'questionId', modelName: 'Question' }, CheckExistValidatorPipe) question: { id: string },
  ) {
    return await this.questionService.deleteQuestion(module._id, question.id);
  }
}
