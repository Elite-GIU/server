import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InstructorController } from './instructor.controller';
import { InstructorService } from './instructor.service';
import { Course, CourseSchema } from '../../database/schemas/course.schema';
import { StudentCourse, StudentCourseSchema } from '../../database/schemas/studentCourse.schema';
import { User, UserSchema } from '../../database/schemas/user.schema';
import { CourseService } from '../course/course.service';
import { DatabaseModule } from '../../database/database.module';
import { Log } from '../../database/schemas/log.schema';
import { LogsService } from '../logs/logs.service';
import { LogsModule } from '../logs/logs.module';

@Module({
  imports: [DatabaseModule,LogsModule],
  controllers: [InstructorController],
  providers: [InstructorService, CourseService, LogsService]
})
export class InstructorModule {}
