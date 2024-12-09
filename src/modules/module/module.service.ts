import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ModuleEntity } from '../../database/schemas/module.schema';
import { Questionbank } from '../../database/schemas/questionbank.schema';
import { Question } from '../../database/schemas/question.schema';
import { CreateModuleDto } from './dto/CreateModuleDto';
import { Content } from '../../database/schemas/content.schema';
import * as path from 'path';
import * as fs from 'fs';
import { UpdateContentDto } from './dto/UpdateContentDto';

@Injectable()
export class ModuleService {
  constructor(
    @InjectModel(ModuleEntity.name) private readonly moduleModel: Model<ModuleEntity>,
    @InjectModel(Questionbank.name) private readonly questionbankModel: Model<Questionbank>,
    @InjectModel(Content.name) private readonly contentModel: Model<Content>,
    @InjectModel(Question.name) private readonly questionModel: Model<Question>,
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
    const sortedModules = modules.map(module => {
      if (module.content && Array.isArray(module.content)) {
        module.content.sort((a: any, b: any) => {
          const order = sortOrder === 'asc' ? 1 : -1;
          return (new Date(a.last_updated).getTime() - new Date(b.last_updated).getTime()) * order;
        });
      }
      return module;
    });
  
    return {
      sortedModules,
    };
  }
 
  // Function to get a specific module by its ID
  async getModuleById(courseId: string, moduleId: string) {
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

  // Function to create a new module for a course
  async createModule(courseId: string, createModuleDto: CreateModuleDto) {
    const courseIdObject = new Types.ObjectId(courseId);
    const { title, nrOfQuestions, assessmentType } = createModuleDto;
    
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

  async updateContent(moduleId: string, contentId: string, updateContentDto: UpdateContentDto, file?: Express.Multer.File) {

    const moduleIdObject = new Types.ObjectId(moduleId);
    const contentIdObject = new Types.ObjectId(contentId);
    
  
    const existingContent = await this.contentModel.findById(contentIdObject);
  
    if (!existingContent) {
      throw new NotFoundException('Content not found');
    }

    if (file) {
      const filePath = path.join('uploads', file.filename);
      fs.renameSync(file.path, filePath);

      const existingContentTitle = await this.contentModel.findOne({
        title: updateContentDto.title,
      });
      if (existingContentTitle) {
        fs.unlinkSync(filePath);
        throw new BadRequestException('Content with the same title already exists.');
      }

      const content = await this.contentModel.create({
        title: updateContentDto.title || existingContent.title,
        description: updateContentDto.description || existingContent.description,
        type: updateContentDto.type || existingContent.type,
        isVisible: true,
        content: filePath,
      });

      existingContent.isVisible = false;
      await existingContent.save();

      await this.moduleModel.findByIdAndUpdate(
        moduleIdObject,
        {
          $push: { content: content._id },
        },
        { new: true, runValidators: true }
      );

      return content;
    } else {
      Object.assign(existingContent, updateContentDto)
      await existingContent.save();
      return existingContent;
    }
  }
}