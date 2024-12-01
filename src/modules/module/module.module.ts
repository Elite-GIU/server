import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ModuleController } from './module.controller';
import { ModuleService } from './module.service';
import { DatabaseModule } from 'src/database/database.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ModuleSchema, ModuleEntity } from 'src/database/schemas/module.schema';
import { Content, ContentSchema } from '../../database/schemas/content.schema';
import { Questionbank, QuestionbankSchema } from '../../database/schemas/questionbank.schema';
import { Question, QuestionSchema } from '../../database/schemas/question.schema';
import { multerConfig } from './config/multer.config';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ModuleEntity.name, schema: ModuleSchema },
      { name: Content.name, schema: ContentSchema },
      { name: Questionbank.name, schema: QuestionbankSchema },
      { name: Question.name, schema: QuestionSchema }
    ]),
    MulterModule.register(multerConfig),
  ],
  controllers: [ModuleController],
  providers: [ModuleService],
})
export class ModuleModule {}