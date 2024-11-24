import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ModuleEntity } from '../../database/schemas/module.schema';
import { Quiz } from '../../database/schemas/quiz.schema';
@Injectable()
export class ModuleService {
    constructor(
        @InjectModel(ModuleEntity.name) private readonly moduleModel: Model<ModuleEntity>,
        @InjectModel(Quiz.name) private readonly quizModel: Model<Quiz>,
    ) {}

   async getModuleContent(userId: string, courseId: string, moduleId: string) {
        const enrollment = await this.moduleModel.findOne({
          user_id: userId,
          course_id: courseId,
        });
        if (!enrollment) throw new NotFoundException('Course enrollment not found');
    
        const module = await this.moduleModel.findById(moduleId);
        if (!module) throw new NotFoundException('Module not found');
    
        const quiz = await this.quizModel.exists({ module_id: moduleId });
    
        return {
          ...module.toObject(),
          hasQuiz: !!quiz,
        };
      }
}
