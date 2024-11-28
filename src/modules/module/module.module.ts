import { Module } from '@nestjs/common';
import { ModuleController } from './module.controller';
import { ModuleService } from './module.service';
import { ModuleEntity, ModuleSchema } from '../../database/schemas/module.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { Questionbank, QuestionbankSchema } from 'src/database/schemas/questionbank.schema';
import { StudentCourse, StudentCourseSchema } from 'src/database/schemas/studentCourse.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ModuleEntity.name, schema: ModuleSchema }]),
    MongooseModule.forFeature([{ name: Questionbank.name, schema: QuestionbankSchema }]),
    MongooseModule.forFeature([{ name: StudentCourse.name, schema: StudentCourseSchema }]),
  ],
  controllers: [ModuleController],
  providers: [ModuleService],
})
export class ModuleModule {}
