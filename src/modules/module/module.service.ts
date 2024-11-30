import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ModuleEntity } from '../../database/schemas/module.schema';
import { Questionbank } from '../../database/schemas/questionbank.schema';
@Injectable()
export class ModuleService {
    constructor(
        @InjectModel(ModuleEntity.name) private readonly moduleModel: Model<ModuleEntity>,
        @InjectModel(Questionbank.name) private readonly questionbankModel: Model<Questionbank>,
    ) {}

   async getModuleContent(moduleId: string) {
        const module = await this.moduleModel.findById(moduleId);
        const quiz = await this.questionbankModel.exists({ module_id: new Types.ObjectId(moduleId) });
        return {
          ...module.toObject(),
          hasQuiz: !!quiz,
        };
      }
}
