import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { MongooseModule } from '@nestjs/mongoose';
import { StudentCourseSchema } from 'src/database/schemas/studentCourse.schema';
import { QuizResponseSchema } from 'src/database/schemas/quizResponse.schema';
import { CourseSchema } from 'src/database/schemas/course.schema';
import { ModuleSchema } from 'src/database/schemas/module.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'StudentCourse', schema: StudentCourseSchema },
      { name: 'QuizResponse', schema: QuizResponseSchema },
      { name: 'Course', schema: CourseSchema },
      { name: 'Module', schema: ModuleSchema },
    ])],
  controllers: [DashboardController],
  providers: [DashboardService]
})
export class DashboardModule {}
