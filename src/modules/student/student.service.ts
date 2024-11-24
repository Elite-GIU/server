import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course } from '../../database/schemas/course.schema';
import { User } from '../../database/schemas/user.schema';
import { StudentCourse } from '../../database/schemas/studentCourse.schema';
import { ModuleEntity } from '../../database/schemas/module.schema';
import { Quiz } from '../../database/schemas/quiz.schema';
@Injectable()
export class StudentService {
  constructor(
    @InjectModel(Course.name) private readonly courseModel: Model<Course>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(StudentCourse.name)
    private readonly studentCourseModel: Model<StudentCourse>,
    @InjectModel(ModuleEntity.name) private readonly moduleModel: Model<ModuleEntity>,
    @InjectModel(Quiz.name) private readonly quizModel: Model<Quiz>,
  ) {}

  async getLearningPath(userId: string) {
    const user = await this.userModel.findById(userId);

    if (!user) throw new NotFoundException('User not found');

    const courses = await this.courseModel
      .find({
        category: { $in: user.preferences },
      })
      .sort({ difficulty_level: 1 });

    return courses;
  }

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

  async getModuleContent(userId: string, courseId: string, moduleId: string) {
    const enrollment = await this.studentCourseModel.findOne({
      user_id: userId,
      course_id: courseId,
    });

    if (!enrollment) throw new NotFoundException('Course enrollment not found');

    const module = await this.moduleModel.findById(moduleId);
    if (!module) throw new NotFoundException('Module not found');

    const quiz = await this.quizModel.exists({ module_id: moduleId });

    return {
      ...module.toObject(),
      hasQuiz: !!quiz,
    };
  }
}
