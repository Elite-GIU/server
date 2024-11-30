import { Module } from '@nestjs/common';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import { DatabaseModule } from 'src/database/database.module';
import { DashboardService } from '../dashboard/dashboard.service';

@Module({
  imports: [DatabaseModule],
  controllers: [QuizController],
  providers: [QuizService, DashboardService]
})
export class QuizModule {}
