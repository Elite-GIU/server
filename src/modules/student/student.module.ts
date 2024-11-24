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
import { Quiz, QuizSchema } from '../../database/schemas/quiz.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Course.name, schema: CourseSchema },
      { name: User.name, schema: UserSchema },
      { name: StudentCourse.name, schema: StudentCourseSchema },
      { name: ModuleEntity.name, schema: ModuleSchema },
      { name: Quiz.name, schema: QuizSchema },
    ]),
    AuthModule,
  ],
  controllers: [StudentController],
  providers: [StudentService],
})
export class StudentModule {}