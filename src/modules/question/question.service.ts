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

  // Function to Get all questions in the module's question bank
  async getQuestionbank(moduleId: string) {
    // Conver the moduleId to an ObjectId
    const moduleIdObject = new Types.ObjectId(moduleId);

    // Find questionbank
    let questionbank = await this.questionbankModel
      .findOne({ module_id: moduleIdObject})
      .populate('questions')
      .exec();

    return {
      questionbank,
    };
  }

  // Function to Create a new question in the module's question bank
  async createQuestion(moduleId: string, createQuestionDto: CreateQuestionDto) {
    // Get the Question from the DTO
    const { question, choices, type, right_choice } = createQuestionDto;

    // Convert the moduleId to an ObjectId
    const moduleIdObject = new Types.ObjectId(moduleId);
    
    // Find the questionbank of the module, (it should exist)
    let questionbank = await this.questionbankModel.findOne({ module_id: moduleIdObject });

    // Check that questoin is unique
    const questionExists = await this.questionModel
      .findOne({ question: question })
      .exec();

    if (questionExists) {
      return new BadRequestException('Question already exists.');
    }

    if(type === 'mcq' && choices.length !== 4) {
      return new BadRequestException('MCQ questions should have 4 choices.');
    }

    if(type === 'true_false' && choices.length !== 2) {
      return new BadRequestException('True/False questions should have 2 choices.');
    }
    if(!choices.includes(right_choice)) {
      return new BadRequestException('The right choice must be one of the provided choices.');
    }


    // Create the question
    const newQuestion = await this.questionModel.create(createQuestionDto);

    // save the question in the questionbank
    await this.questionbankModel.findByIdAndUpdate(
      questionbank._id,
      {
        $push: { questions: newQuestion._id },
      },
      { new: true }
    );

    return {
      question,
    };
  }

  // Function to Update a question in the module's question bank
  async updateQuestion(moduleId: string, questionId: string, updateQuestionDto: UpdateQuestionDto) {

      const {choices , right_choice} = updateQuestionDto;
      if(choices && right_choice){

        if(!choices.includes(right_choice)) {
          throw new BadRequestException('The right choice must be one of the provided choices.');
        }
      }
      // Convert moduleId and questionId to ObjectId instances
    const moduleIdObject = new Types.ObjectId(moduleId);
    const questionIdObject = new Types.ObjectId(questionId);
    // Check if the question exists in the question bank of the given module
    const questionbank = await this.questionbankModel.findOne({
      module_id: moduleIdObject,
      questions: questionIdObject, 
    });
    if (!questionbank) {
      return new NotFoundException('Question not found in the specified module.');
    }
  
    // Update the question
    const updatedQuestion = await this.questionModel.findByIdAndUpdate(
      questionIdObject,
      updateQuestionDto,
      { new: true, runValidators: true }
    );
    return {
      updatedQuestion,
    };
  }
  
  async deleteQuestion(moduleId: string, questionId: string) {
    // Convert moduleId and questionId to ObjectId instances
    const moduleIdObject = new Types.ObjectId(moduleId);
    const questionIdObject = new Types.ObjectId(questionId);
    
    // Check if the question exists in the question bank of the given module
    const questionbank = await this.questionbankModel.findOne({
      module_id: moduleIdObject,
      questions: questionIdObject, 
    });

    if (!questionbank) {
      throw new NotFoundException('Question not found in the specified module.');
    }

    // Delete the question
    await this.questionModel.findByIdAndDelete(questionIdObject);

    // Remove the question from the questionbank
    await this.questionbankModel.findByIdAndUpdate(
      questionbank._id,
      {
        $pull: { questions: questionIdObject },
      },
      { new: true }
    );

    return {
      message: 'Question deleted successfully.',
    };
 }
}