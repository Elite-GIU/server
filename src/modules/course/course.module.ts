import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';
import { Course, CourseSchema } from '../../database/schemas/course.schema';
import { StudentCourse, StudentCourseSchema } from '../../database/schemas/studentCourse.schema';
import { UserSchema } from 'src/database/schemas/user.schema';
import { ModuleEntity, ModuleSchema } from '../../database/schemas/module.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Course', schema: CourseSchema },
      { name: StudentCourse.name, schema: StudentCourseSchema },
      { name: 'User', schema: UserSchema}
      { name: ModuleEntity.name, schema: ModuleSchema },
    ]),
  ],
  controllers: [CourseController],
  providers: [CourseService],
})
export class CourseModule {}
