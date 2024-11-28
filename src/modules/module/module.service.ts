import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ModuleEntity } from '../../database/schemas/module.schema';
import { Questionbank } from '../../database/schemas/questionbank.schema';
import { StudentCourse } from 'src/database/schemas/studentCourse.schema';
@Injectable()
export class ModuleService {
    constructor(
        @InjectModel(ModuleEntity.name) private readonly moduleModel: Model<ModuleEntity>,
        @InjectModel(Questionbank.name) private readonly questionbankModel: Model<Questionbank>,
        @InjectModel(StudentCourse.name) private readonly studentCourseModel: Model<StudentCourse>
    ) {}

   async getModuleContent(moduleId: string) {
        const module = await this.moduleModel.findById(moduleId);
        if (!module) throw new NotFoundException('Module not found');
    
        const quiz = await this.questionbankModel.exists({ module_id: new Types.ObjectId(moduleId) });
    
        return {
          ...module.toObject(),
          hasQuiz: !!quiz,
        };
      }
}
