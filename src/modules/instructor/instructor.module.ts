import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InstructorController } from './instructor.controller';
import { InstructorService } from './instructor.service';
import { Course, CourseSchema } from '../../database/schemas/course.schema';
import { StudentCourse, StudentCourseSchema } from '../../database/schemas/studentCourse.schema';
import { User, UserSchema } from '../../database/schemas/user.schema';
import { CourseService } from '../course/course.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Course.name, schema: CourseSchema },
      { name: StudentCourse.name, schema: StudentCourseSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [InstructorController],
  providers: [InstructorService, CourseService]
})
export class InstructorModule {}
