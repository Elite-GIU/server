import { Module } from '@nestjs/common';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import { DatabaseModule } from '../../database/database.module';
import { DashboardService } from '../dashboard/dashboard.service';
import { LogsModule } from '../logs/logs.module';
import { LogsService } from '../logs/logs.service';

@Module({
  imports: [DatabaseModule, LogsModule],
  controllers: [QuizController],
  providers: [QuizService, DashboardService, LogsService]
})
export class QuizModule {}
