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
}
