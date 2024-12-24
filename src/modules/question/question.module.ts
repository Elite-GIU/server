import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuestionService } from './question.service';
import { QuestionController } from './question.controller';
import { ModuleSchema, ModuleEntity } from '../../database/schemas/module.schema';
import { Questionbank, QuestionbankSchema } from '../../database/schemas/questionbank.schema';
import { Question, QuestionSchema } from '../../database/schemas/question.schema'; 
import { DatabaseModule } from '../../database/database.module';
import { Log } from '../../database/schemas/log.schema';
import { LogsModule } from '../logs/logs.module';
import { LogsService } from '../logs/logs.service';

@Module({
  imports: [ DatabaseModule, LogsModule],
  providers: [QuestionService,  LogsService],
  controllers: [QuestionController],
})
export class QuestionModule {}
