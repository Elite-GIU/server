import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course } from '../../database/schemas/course.schema';
import { StudentCourse } from '../../database/schemas/studentCourse.schema';
import { ModuleEntity } from '../../database/schemas/module.schema';

@Injectable()
export class CourseService {
    constructor(
        @InjectModel(Course.name) private readonly courseModel: Model<Course>,
        @InjectModel(StudentCourse.name) private readonly studentCourseModel: Model<StudentCourse>,
        @InjectModel(ModuleEntity.name) private readonly moduleModel: Model<ModuleEntity>,
    ) {}

    async getStudentCourses(userId: string) {
        const studentCourses = await this.studentCourseModel
          .find({ user_id: userId })
          .populate('course_id');
      
        return studentCourses.map(studentCourse => studentCourse.course_id);
      }
    
      async getStudentCourseWithModules(userId: string, courseId: string) {
        const studentCourse = await this.studentCourseModel
          .findOne({ user_id: userId, course_id: courseId })
          .populate('course_id');
      
        if (!studentCourse) {
          throw new NotFoundException('Course not found for this student');
        }
      
        const course = studentCourse.course_id;
        const modules = await this.moduleModel
          .find({ course_id: course._id })
          .select('-content -resources');
      
        return {
          course,
          modules,
        };
      }
}
