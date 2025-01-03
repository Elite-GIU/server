import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ModuleEntity } from '../../database/schemas/module.schema';
import { Questionbank } from '../../database/schemas/questionbank.schema';
import { Question } from '../../database/schemas/question.schema';
import { CreateModuleDto } from './dto/CreateModuleDto';
import { GetModuleDto } from './dto/GetModuleDto';
import { Content } from '../../database/schemas/content.schema';
import { Notification } from '../../database/schemas/notification.schema';
import * as path from 'path';
import * as fs from 'fs';
import { UpdateContentDto } from './dto/UpdateContentDto';
import { QuizResponse } from '../../database/schemas/quizResponse.schema';
import { plainToInstance } from 'class-transformer';
import { UpdateModuleAssessmentDto } from './dto/UpdateModuleAssessmentDto';
import { ChatService } from '../chat/chat.service';
import { Course } from '../../database/schemas/course.schema';
import { StudentCourse } from '../../database/schemas/studentCourse.schema';
@Injectable()
export class ModuleService {
  constructor(
    @InjectModel(ModuleEntity.name) private readonly moduleModel: Model<ModuleEntity>,
    @InjectModel(Questionbank.name) private readonly questionbankModel: Model<Questionbank>,
    @InjectModel(Content.name) private readonly contentModel: Model<Content>,
    @InjectModel(Question.name) private readonly questionModel: Model<Question>,
    @InjectModel(QuizResponse.name) private readonly quizResponseModel: Model<QuizResponse>,
    @InjectModel(Notification.name) private readonly notificationModel: Model<Notification>,
    @InjectModel(Course.name) private readonly courseModel: Model<Course>,
    @InjectModel(StudentCourse.name) private readonly studentCourseModel: Model<StudentCourse>,

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
      .find({ course_id: courseIdObject, isDeleted: false })
      .populate('content')
      .sort({ created_at: sortOrder as 'asc' | 'desc' }) 
      .exec();
  
    // Handle case when no modules are found
    if (!modules.length) {
      return [];
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
        _id: module._id
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
      .findOne({ _id: moduleIdObject, course_id: courseIdObject, isDeleted: false })
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

    const modules = await this.moduleModel.find({ course_id: courseIdObject , isDeleted: false}).sort({ created_at: 1 });
    const currentModuleIndex = modules.findIndex(module => module._id.toString() === moduleIdObject.toString());

    if (currentModuleIndex === -1) {
      throw new NotFoundException('Module not found.');
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

    const members_list = await this.getMembersList(courseId);
    const course = await this.courseModel.findOne({
      _id: new Types.ObjectId(courseId),
    });
    // Send notification to course members
    await this.sendNotification(
      members_list,
      `New module`,
      `You have a new module in ${course.title}`,
      'thread',
    );
    

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
      // if (existingContent) {
      //   fs.unlinkSync(filePath);
      //   throw new BadRequestException('Content with the same title already exists.');
      // }

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

    // Get courseId
    const module = await this.moduleModel.findOne({ _id: moduleId });
    const courseId: string = module.course_id + '';
    const members_list = await this.getMembersList(courseId);
    const course = await this.courseModel.findOne({
      _id: new Types.ObjectId(courseId),
    });
    // Send notification to course members
    await this.sendNotification(
      members_list,
      `New content`,
      `You have new content: ${uploadContentDto.title} in ${course.title}`,
      'thread',
    );


      return {
        content,
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
    if (file) {

      const filePath = path.join('uploads', file.filename);
      fs.renameSync(file.path, filePath);

      const existingContentTitle = await this.contentModel.findOne({
        title: updateContentDto.title,
      });
      // if (existingContentTitle) {
      //   fs.unlinkSync(filePath);
      //   throw new BadRequestException('Content with the same title already exists.');
      // }

      const content = await this.contentModel.create({
        title: updateContentDto.title || existingContent.title,
        description: updateContentDto.description || existingContent.description,
        type: updateContentDto.type || existingContent.type,
        isVisible: updateContentDto.isVisible || existingContent.isVisible,
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
      Object.keys(updateContentDto).forEach(key => {
        if (updateContentDto[key] !== null && updateContentDto[key] !== undefined && updateContentDto[key] !== '') {
            existingContent[key] = updateContentDto[key];
        }
    });
      await existingContent.save();
      return existingContent;
    }
  }

  async downloadContent(contentId: string) {
    const contentIdObj = new Types.ObjectId(contentId);
    const content = await this.contentModel.findById(contentIdObj);

    if (!content) throw new NotFoundException('Content not found');
    return content;
  }

  async updateModule(
    courseId: string,
    moduleId: string,
    updateData: {
      assessmentType?: string;
      numberOfQuestions?: number;
      passingGrade?: number;
      title?: string;
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
        ...(updateData.title && { title: updateData.title }),
        ...(updateData.assessmentType && { assessmentType: updateData.assessmentType }),
        ...(updateData.numberOfQuestions && { numberOfQuestions: updateData.numberOfQuestions }),
        ...(updateData.passingGrade && { passingGrade: updateData.passingGrade }),
      },
      { new: true },
    );
    return updatedModule;
  }

  async rateModule(moduleId: string, rating: number) {
    const ratingIndex = rating - 1;
    const updatedModule = await this.moduleModel.findByIdAndUpdate(
      moduleId,
      {
        $inc: { [`ratings.${ratingIndex}`]: 1 },
      },
      { new: true }, 
    );
    return updatedModule;
  }

  async getContent(contentId: string, moduleId: string, isInstructor: boolean) {
    const moduleIdObject = new Types.ObjectId(moduleId);
    const contentIdObject = new Types.ObjectId(contentId);
    const content = await this.contentModel.findById(contentIdObject);
    const module = await this.moduleModel.findById(moduleIdObject);

    if (!content) throw new NotFoundException('Content not found');
    if(!module.content.includes(contentIdObject)) throw new NotFoundException("Content not found");
    if(!isInstructor) {
      if(!content.isVisible) throw new NotFoundException("Content not found");
    }

    return content;
  }

  async deleteModule(moduleId: string): Promise<ModuleEntity> {
    const module = await this.moduleModel.findById(moduleId);
    module.isDeleted = true;
    await module.save();
    return module;
  }

  async getMembersList(course_id: string) {
    
    const notify_list = await this.studentCourseModel
      .find({
        course_id: new Types.ObjectId(course_id),
      })
      .select('user_id');

    
    return notify_list;
  }

  async sendNotification(
    notify_list: any,
    title: string,
    message: string,
    type: string,
  ) {
    var transformedNotifyList;
    if (type === 'thread') {
      transformedNotifyList = notify_list.map(
        (member) => new Types.ObjectId(member.user_id),
      );
    } else {
      transformedNotifyList = notify_list.map(
        (member) => new Types.ObjectId(member),
      );
    }
    await this.notificationModel.create({
      notify_list: transformedNotifyList,
      title: title,
      message: message,
      type: type,
    });
  }
}