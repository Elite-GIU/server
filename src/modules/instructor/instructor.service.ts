import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course } from '../../database/schemas/course.schema';
import { StudentCourse } from '../../database/schemas/studentCourse.schema';
import { User } from '../../database/schemas/user.schema';
import { InstructorDataDto } from './dto/InstructorDataDto';

@Injectable()
export class InstructorService {
  
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async getInstructors(page: number, limit: number, name?: string): Promise<InstructorDataDto[]> {
    if (page < 1 || limit < 1) {
      throw new BadRequestException('Page and limit must be positive integers');
    }

    const query: any = { role: 'instructor' };
    if (name) {
      query.name = { $regex: name, $options: 'i' }; // Case-insensitive name matching
    }

    const instructors = await this.userModel
      .find(query)
      .skip((page - 1) * limit)
      .limit(limit);
    //remove everything except name and email and preferences in the response , convert the response to InstructorDataDto
    const filteredInstructors = instructors.map(instructor => {
      const { name, email, preferences } = instructor;
      return { name, email, preferences };
    });
    if (!instructors || instructors.length === 0) {
      throw new NotFoundException('No instructors found');
    }

    return filteredInstructors;
  }
}
