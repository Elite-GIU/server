import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ModuleEntity } from '../../database/schemas/module.schema';
import { Questionbank } from '../../database/schemas/questionbank.schema';
import { Question } from '../../database/schemas/question.schema';
import { CreateModuleDto } from './dto/CreateModuleDto';
import { GetModuleDto } from './dto/GetModuleDto';
import { Content } from '../../database/schemas/content.schema';
import * as path from 'path';
import * as fs from 'fs';
import { QuizResponse } from 'src/database/schemas/quizResponse.schema';
import { plainToInstance } from 'class-transformer';
import { UpdateModuleAssessmentDto } from './dto/UpdateModuleAssessmentDto';

@Injectable()
export class ModuleService {
  constructor(
    @InjectModel(ModuleEntity.name) private readonly moduleModel: Model<ModuleEntity>,
    @InjectModel(Questionbank.name) private readonly questionbankModel: Model<Questionbank>,
    @InjectModel(Content.name) private readonly contentModel: Model<Content>,
    @InjectModel(Question.name) private readonly questionModel: Model<Question>,
    @InjectModel(QuizResponse.name) private readonly quizResponseModel: Model<QuizResponse>,
  ) {}

  // Function to get all modules for a course with a given courseId
  async getModulesHierarchy(courseId: string, sortOrder: string) {
    // Validate sortOrder
    // It should be either 'asc' or 'desc'
    if (!['asc', 'desc'].includes(sortOrder)) {
      throw new BadRequestException(
        `Invalid sortOrder value. Expected 'asc' or 'desc', but got '${sortOrder}'.`,
      );
    }
  
    // Convert courseId to ObjectId
    const courseIdObject = new Types.ObjectId(courseId);
  
    // Fetch and sort modules based on created_at field of the module
    // Populate the `content` field in each module
    const modules = await this.moduleModel
      .find({ course_id: courseIdObject })
      .populate('content')
      .sort({ created_at: sortOrder as 'asc' | 'desc' }) 
      .exec();
  
    // Handle case when no modules are found
    if (!modules.length) {
      throw new NotFoundException(`No modules found for course with ID ${courseId}`);
    }
  
     // Sort the nested `content` array within each module
    const sortedModules = modules.map((module) => {
      if (module.content && Array.isArray(module.content)) {
        // Sorting the content array based on 'last_updated' property
        module.content.sort((a: any, b: any) => {
          const order = sortOrder === 'asc' ? 1 : -1;
          return (
            (new Date(a.last_updated).getTime() - new Date(b.last_updated).getTime()) * order
          );
        });
      }
      return module;
    });

    // Map the sorted modules to the GetModuleDto structure
    return plainToInstance(
      GetModuleDto,
      sortedModules.map((module) => ({
        title: module.title,
        nrOfQuestions: module.numberOfQuestions,
        assessmentType: module.assessmentType,
        passingGrade: module.passingGrade,
      })),
    );
  }
 
  // Function to get a specific module by its ID
  async getInstructorModuleById(courseId: string, moduleId: string) {   
    // Convert courseId and moduleId to ObjectId
    const courseIdObject = new Types.ObjectId(courseId);
    const moduleIdObject = new Types.ObjectId(moduleId);

    // Fetch the module with the given ID and populate the `content` field
    const module = await this.moduleModel
      .findOne({ _id: moduleIdObject, course_id: courseIdObject })
      .populate('content')
      .exec();

    return {
      module,
    };
  }

  async getStudentModuleById(courseId: string, moduleId: string, userId: string){
    const courseIdObject = new Types.ObjectId(courseId);
    const moduleIdObject = new Types.ObjectId(moduleId);
    const studentIdObject = new Types.ObjectId(userId);

    const modules = await this.moduleModel.find({ course_id: courseIdObject }).sort({ created_at: 1 });
    const currentModuleIndex = modules.findIndex(module => module._id.toString() === moduleIdObject.toString());

    if (currentModuleIndex === -1) {
      throw new Error('Module not found.');
    }

    if (currentModuleIndex!==0){
      const previousModule = modules[currentModuleIndex - 1];
      if (!previousModule) {
        throw new Error('No previous module found.');
      }
    
      const quizResponse = await this.quizResponseModel.find({
        user_id: studentIdObject,
        module_id: previousModule._id,
      }).sort({ score: -1 });

      if (!quizResponse.length || quizResponse[0].finalGrade === 'failed') {
        throw new ForbiddenException('You must pass the previous module to access this module.');
      }
    }

    const module = await this.moduleModel
      .findOne({ _id: moduleIdObject, course_id: courseIdObject })
      .populate('content')
      .exec();

      if (!module) {
        throw new Error('Module not found.');
      }
    
      // Filter the content to include only visible items
      const filteredContent = (module.content || []).filter(
        (contentItem: any) => contentItem.isVisible === true,
      );
    
      return {
        ...module.toObject(),
        content: filteredContent,
      };
  }

  // Function to create a new module for a course
  async createModule(courseId: string, createModuleDto: CreateModuleDto) {
    const courseIdObject = new Types.ObjectId(courseId);
    const { title, nrOfQuestions, assessmentType, passingGrade } = createModuleDto;
    
    // Check if a module with the same title already exists
    const existingModule = await this.moduleModel.findOne({
      course_id: courseIdObject,
      title,
    });
    if (existingModule) {
      throw new BadRequestException('A module with the same title already exists.');
    }
    
    // Create a new module
    const newModule = new this.moduleModel({
      course_id: courseIdObject,
      title,
      numberOfQuestions: nrOfQuestions,
      assessmentType,
      content: [],
      passingGrade,
    });
    await newModule.save();

    // Create questionbank for the module
    const questionbank = new this.questionbankModel({
      module_id: newModule._id,
      questions: [],
    });
    await questionbank.save();

    return {
      newModule,
    };
  }

  // Function to upload content to a specific module of a course
  async uploadContent(moduleId: string, uploadContentDto: any, file: Express.Multer.File) {
    // convert moduleId to ObjectId
    const moduleIdObject = new Types.ObjectId(moduleId);
    
    try {
      const filePath = path.join('uploads', file.filename);
      fs.renameSync(file.path, filePath);

      // Check title is unique
      const existingContent = await this.contentModel.findOne({
        title: uploadContentDto.title,
      });
      if (existingContent) {
        fs.unlinkSync(filePath);
        throw new BadRequestException('Content with the same title already exists.');
      }

      // Create content
      const content = await this.contentModel.create({
        title: uploadContentDto.title,
        description: uploadContentDto.description,
        type: uploadContentDto.type,
        isVisible: true,
        content: filePath,
      });
      
      // Update module with new content
      await this.moduleModel.findByIdAndUpdate(
        moduleIdObject,
        {
          $push: { content: content._id },
        },
        { new: true, runValidators: true }
      );

      return {
        filePath,
      };
    } catch (error) {
      if (file && file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw new BadRequestException(`Failed to upload content: ${error.message}`);
    }
  }
  async updateModule(
    courseId: string,
    moduleId: string,
    updateData: {
      assessmentType?: string;
      numberOfQuestions?: number;
      passingGrade?: number;
    },
    userId: string,
  ) {
    const courseIdObject = new Types.ObjectId(courseId);
    const moduleIdObject = new Types.ObjectId(moduleId);
    const studentIdObject = new Types.ObjectId(userId);
  
    // Check if any quizzes have been taken for this module
    const quizResponses = await this.quizResponseModel.find({ module_id: moduleIdObject });
  
    if (quizResponses.length > 0) {
      throw new ForbiddenException('Cannot update the module as quizzes have already been taken.');
    }
  
    // Update the module
    const updatedModule = await this.moduleModel.findByIdAndUpdate(
      moduleIdObject,
      {
        ...(updateData.assessmentType && { assessmentType: updateData.assessmentType }),
        ...(updateData.numberOfQuestions && { numberOfQuestions: updateData.numberOfQuestions }),
        ...(updateData.passingGrade && { passingGrade: updateData.passingGrade }),
      },
      { new: true },
    );
    return updatedModule;
  }
}