import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InstructorController } from './instructor.controller';
import { InstructorService } from './instructor.service';
import { Course, CourseSchema } from '../../database/schemas/course.schema';
import { StudentCourse, StudentCourseSchema } from '../../database/schemas/studentCourse.schema';
import { User, UserSchema } from '../../database/schemas/user.schema';
import { CourseService } from '../course/course.service';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [InstructorController],
  providers: [InstructorService, CourseService]
})
export class InstructorModule {}
