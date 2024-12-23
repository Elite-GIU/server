import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';
import { Course, CourseSchema } from '../../database/schemas/course.schema';
import { User, UserSchema } from '../../database/schemas/user.schema';
import {
  StudentCourse,
  StudentCourseSchema,
} from '../../database/schemas/studentCourse.schema';
import {
  ModuleEntity,
  ModuleSchema,
} from '../../database/schemas/module.schema';
import { Content, ContentSchema } from '../../database/schemas/content.schema';
import { AuthModule } from '../auth/auth.module';
import { LogsModule } from '../logs/logs.module'; // Add this import
import { LogsService } from '../logs/logs.service';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [
    LogsModule,
    DatabaseModule,
    AuthModule,
  ],
  controllers: [StudentController],
  providers: [StudentService,LogsService],
})
export class StudentModule {}
