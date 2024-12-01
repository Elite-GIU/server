import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ModuleEntity } from '../../database/schemas/module.schema';
import { Questionbank } from '../../database/schemas/questionbank.schema';
import { Question } from '../../database/schemas/question.schema';
import { CreateModuleDto } from './dto/CreateModuleDto';
import { Content } from '../../database/schemas/content.schema';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class ModuleService {
  constructor(
    @InjectModel(ModuleEntity.name) private readonly moduleModel: Model<ModuleEntity>,
    @InjectModel(Questionbank.name) private readonly questionbankModel: Model<Questionbank>,
    @InjectModel(Content.name) private readonly contentModel: Model<Content>,
    @InjectModel(Question.name) private readonly questionModel: Model<Question>,
  ) {}

  async findModuleByTitle(courseId: string, title: string) {
    return this.moduleModel.findOne({ course_id: courseId, title }).exec();
  }

  async getModules(courseId: string) {
    const modules = await this.moduleModel
      .find({ course_id: courseId })
      .populate('content')
      .sort({ created_at: 'asc' })
      .exec();

    return {
      message: 'Modules retrieved successfully',
      modules,
    };
  }
  // in hierachy 
  async getModulesHierachy(
    courseId: string,
    sortOrder: 'asc' | 'desc' = 'asc',
  ): Promise<{ message: string; count: number; modules: any[] }> {
    // Validate courseId and sortOrder
    if (!['asc', 'desc'].includes(sortOrder)) {
      throw new BadRequestException(
        `Invalid sortOrder value. Expected 'asc' or 'desc', but got '${sortOrder}'.`,
      );
    }
      const modules = await this.moduleModel
      .find({ course_id: courseId })
      .populate('content') 
      .sort({ created_at: sortOrder === 'asc' ? 1 : -1 }) 
      .exec();
  
    // Handle case when no modules are found
    if (!modules.length) {
      throw new NotFoundException(`No modules found for course with ID ${courseId}`);
    }
  
    return {
      message: 'Modules retrieved successfully',
      count: modules.length,
      modules,
    };
  }
  

  

  async getModuleById(courseId: string, moduleId: string) {
    const module = await this.moduleModel
      .findOne({ _id: moduleId, course_id: courseId })
      .populate('content')
      .exec();

    if (!module) {
      throw new NotFoundException('Module not found or not associated with the given course.');
    }

    return {
      message: 'Module retrieved successfully',
      module,
    };
  }

/*
  async createModule(courseId: string, createModuleDto: CreateModuleDto) {
    const session = await this.moduleModel.db.startSession();
    session.startTransaction();
    try {
      const { title, nrOfQuestions, assessmentType } = createModuleDto;
  
      const newModule = new this.moduleModel({
        course_id: new Types.ObjectId(courseId),
        title,
        numberOfQuestions: nrOfQuestions,
        assessmentType,
        content: [],
      });
  
      const savedModule = await newModule.save({ session });
      await this.createQuestionBank(savedModule._id as Types.ObjectId, session);
  
      await session.commitTransaction();
  
      return {
        message: 'Module and its question bank created successfully.',
        module: savedModule,
      };
    } catch (error) {
      await session.abortTransaction();
      throw new BadRequestException(`Failed to create module: ${error.message}`);
    } finally {
      session.endSession();
    }
  }*/
    async createModule(courseId: string, createModuleDto: CreateModuleDto) {
      const { title, nrOfQuestions, assessmentType } = createModuleDto;
  
      const newModule = new this.moduleModel({
        course_id: courseId,
        title,
        numberOfQuestions: nrOfQuestions,
        assessmentType,
        content: [],
      });
  
      await newModule.save();
  
      // Create questionbank for the module
      const questionbank = new this.questionbankModel({
        module_id: newModule._id,
        questions: [],
      });
      await questionbank.save();
  
      return {
        message: 'Module created successfully.',
        module: newModule,
      };
    }


  async uploadContent(courseId: string, moduleId: string, uploadContentDto: any, file: Express.Multer.File) {
    const module = await this.moduleModel.findOne({
      _id: moduleId,
      course_id: courseId,
    });

    if (!module) {
      throw new BadRequestException('Module not found or not associated with the given course.');
    }

    try {
      const filePath = path.join('uploads', file.filename);
      fs.renameSync(file.path, filePath);

      const content = await this.contentModel.create({
        title: uploadContentDto.title,
        description: uploadContentDto.description,
        type: uploadContentDto.type,
        isVisible: true,
        content: filePath,
      });

      await this.moduleModel.findByIdAndUpdate(
        moduleId,
        {
          $push: { content: content._id },
        },
        { new: true, runValidators: true }
      );

      return {
        message: 'Content uploaded successfully',
        contentId: content._id,
        contentUrl: filePath,
      };
    } catch (error) {
      if (file && file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw new BadRequestException(`Failed to upload content: ${error.message}`);
    }
  }
}