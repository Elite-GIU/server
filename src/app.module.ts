import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { InstructorModule } from './modules/instructor/instructor.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { CourseModule } from './modules/course/course.module';
import { LogsModule } from './modules/logs/logs.module';
import { ModuleModule } from './modules/module/module.module';
import { QuizModule } from './modules/quiz/quiz.module';
import { StudentModule } from './modules/student/student.module';
import { ChatModule } from './modules/chat/chat.module';
import { QuestionModule } from './modules/question/question.module';
import { NotificationModule } from './modules/notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    UserModule,
    AuthModule,
    InstructorModule,
    DashboardModule,
    CourseModule,
    LogsModule,
    ModuleModule,
    QuizModule,
    StudentModule,
    ChatModule,
    QuestionModule,
    NotificationModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
