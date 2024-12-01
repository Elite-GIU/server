import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ModuleEntity } from '../../database/schemas/module.schema';
import { Questionbank } from '../../database/schemas/questionbank.schema';
import { Question } from '../../database/schemas/question.schema';
import { CreateQuestionDto } from './dto/CreateQuestionDto';
import { UpdateQuestionDto } from './dto/UpdateQuestionDto';

@Injectable()
export class QuestionService {
  constructor(
    @InjectModel(ModuleEntity.name) private readonly moduleModel: Model<ModuleEntity>,
    @InjectModel(Questionbank.name) private readonly questionbankModel: Model<Questionbank>,
    @InjectModel(Question.name) private readonly questionModel: Model<Question>,
  ) {}

  async createQuestion(courseId: string, moduleId: string, createQuestionDto: CreateQuestionDto) {
    // First check if module exists and belongs to course
    const module = await this.moduleModel.findOne({
      _id: moduleId,
      course_id: courseId,
    });

    if (!module) {
      throw new NotFoundException('Module not found or not associated with the given course.');
    }

    // Find or create questionbank for the module
    let questionbank = await this.questionbankModel.findOne({ module_id: moduleId });
    if (!questionbank) {
      questionbank = await this.questionbankModel.create({
        module_id: moduleId,
        questions: [],
      });
    }
    const question = await this.questionModel.create(createQuestionDto);
    await this.questionbankModel.findByIdAndUpdate(
      questionbank._id,
      {
        $push: { questions: question._id },
      },
      { new: true }
    );

    return {
      message: 'Question created successfully',
      question,
    };
  }

  async getQuestionbank(courseId: string, moduleId: string) {
    const module = await this.moduleModel.findOne({
      _id: moduleId,
      course_id: courseId,
    });

    if (!module) {
      throw new NotFoundException('Module not found or not associated with the given course.');
    }

    // Find or create questionbank
    let questionbank = await this.questionbankModel
      .findOne({ module_id: moduleId })
      .populate('questions')
      .exec();

    if (!questionbank) {
      questionbank = await this.questionbankModel.create({
        module_id: moduleId,
        questions: [],
      });
    }

    return {
      message: 'Question bank retrieved successfully',
      questionbank,
    };
  }
  
  private async createQuestionBank(moduleId: Types.ObjectId, session?: any) {
    try {
      const questionbank = new this.questionbankModel({
        module_id: moduleId,
        questions: [],
      });
      
      if (session) {
        await questionbank.save({ session });
      } else {
        await questionbank.save();
      }
      
      return questionbank;
    } catch (error) {
      throw new BadRequestException(`Failed to create question bank: ${error.message}`);
    }
  }
  /*async createQuestion(courseId: string, moduleId: string, createQuestionDto: CreateQuestionDto) {
    const module = await this.moduleModel.findOne({
      _id: moduleId,
      course_id: courseId,
    });

    if (!module) {
      throw new NotFoundException('Module not found or not associated with the given course.');
    }

    let questionbank = await this.questionbankModel.findOne({ module_id: moduleId });
    if (!questionbank) {
      // Create question bank if it doesn't exist
      questionbank = await this.createQuestionBank(new Types.ObjectId(moduleId));
    }

    const question = new this.questionModel(createQuestionDto);
    await question.save();

    await this.questionbankModel.findByIdAndUpdate(
      questionbank._id,
      {
        $push: { questions: question._id },
      },
      { new: true }
    );

    return {
      message: 'Question created successfully',
      question,
    };
  }

  async getQuestionbank(courseId: string, moduleId: string) {
    const module = await this.moduleModel.findOne({
      _id: moduleId,
      course_id: courseId,
    });

    if (!module) {
      throw new NotFoundException('Module not found or not associated with the given course.');
    }

    let questionbank = await this.questionbankModel
      .findOne({ module_id: moduleId })
      .populate('questions')
      .exec();

    if (!questionbank) {
      // Create question bank if it doesn't exist
      questionbank = await this.createQuestionBank(new Types.ObjectId(moduleId));
    }

    return {
      message: 'Question bank retrieved successfully',
      questionbank,
    };
  }*/

  async updateQuestion(
    courseId: string,
    moduleId: string,
    questionId: string,
    updateQuestionDto: UpdateQuestionDto,
  ) {
    const module = await this.moduleModel.findOne({
      _id: moduleId,
      course_id: courseId,
    });

    if (!module) {
      throw new NotFoundException('Module not found or not associated with the given course.');
    }

    const questionbank = await this.questionbankModel.findOne({ module_id: moduleId });
    if (!questionbank || !questionbank.questions.includes(new Types.ObjectId(questionId))) {
      throw new NotFoundException('Question not found in this module\'s question bank.');
    }

    const updatedQuestion = await this.questionModel.findByIdAndUpdate(
      questionId,
      updateQuestionDto,
      { new: true, runValidators: true }
    );

    if (!updatedQuestion) {
      throw new NotFoundException('Question not found.');
    }

    return {
      message: 'Question updated successfully',
      question: updatedQuestion,
    };
  }

  async deleteQuestion(courseId: string, moduleId: string, questionId: string) {
    const module = await this.moduleModel.findOne({
      _id: moduleId,
      course_id: courseId,
    });

    if (!module) {
      throw new NotFoundException('Module not found or not associated with the given course.');
    }

    const questionbank = await this.questionbankModel.findOne({ module_id: moduleId });
    if (!questionbank) {
      throw new NotFoundException('Question bank not found for this module.');
    }

    // Remove question from questionbank
    await this.questionbankModel.findByIdAndUpdate(
      questionbank._id,
      {
        $pull: { questions: questionId },
      },
      { new: true }
    );

    // Delete the question
    const deletedQuestion = await this.questionModel.findByIdAndDelete(questionId);
    if (!deletedQuestion) {
      throw new NotFoundException('Question not found.');
    }

    return {
      message: 'Question deleted successfully',
    };
  }
}