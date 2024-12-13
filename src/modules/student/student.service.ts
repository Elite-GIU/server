import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Course } from '../../database/schemas/course.schema';
import { User } from '../../database/schemas/user.schema';
import { Content } from '../../database/schemas/content.schema';

@Injectable()
export class StudentService {
  constructor(
    @InjectModel(Course.name) private readonly courseModel: Model<Course>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Content.name) private readonly contentModel: Model<Content>,
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
