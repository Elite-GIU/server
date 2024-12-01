import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuestionService } from './question.service';
import { QuestionController } from './question.controller';
import { ModuleSchema, ModuleEntity } from 'src/database/schemas/module.schema';
import { Questionbank, QuestionbankSchema } from '../../database/schemas/questionbank.schema';
import { Question, QuestionSchema } from '../../database/schemas/question.schema'; 

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ModuleEntity.name, schema: ModuleSchema },
      { name: Questionbank.name, schema: QuestionbankSchema },
      { name: Question.name, schema: QuestionSchema },
    ]),
  ],
  providers: [QuestionService],
  controllers: [QuestionController],
})
export class QuestionModule {}
