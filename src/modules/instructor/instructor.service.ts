import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course } from '../../database/schemas/course.schema';
import { StudentCourse } from '../../database/schemas/studentCourse.schema';
import { User } from '../../database/schemas/user.schema';

@Injectable()
export class InstructorService {
  constructor(
    @InjectModel(Course.name) private readonly courseModel: Model<Course>,
    @InjectModel(StudentCourse.name) private readonly studentCourseModel: Model<StudentCourse>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async getAllInstructors(): Promise<User[]> {
    const instructors = await this.userModel.find({ role: 'instructor' });
    if (!instructors || instructors.length === 0) {
      throw new NotFoundException('No instructors found');
    }
    return instructors;
  }

  async getInstructorsByName(name: string): Promise<User[]> {
    if (!name) {
      throw new BadRequestException('Name parameter is required');
    }
  
    const instructors = await this.userModel.find({
      role: 'instructor',
      name: { $regex: name, $options: 'i' }, // Case-insensitive name matching
    });
  
    if (!instructors || instructors.length === 0) {
      throw new NotFoundException(`No instructors found with name matching "${name}"`);
    }
  
    return instructors;
  }
  
}
