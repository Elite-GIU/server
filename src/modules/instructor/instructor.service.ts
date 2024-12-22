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

  async getInstructors(page: number, limit: number, name?: string) {
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
      const { name, email, preferences, ratings = [] } = instructor;
      const averageRating = this.calculateAverageRatings(ratings);
      return { name, email, preferences, averageRating };
    });
    if (!instructors || instructors.length === 0) {
      throw new NotFoundException('No instructors found');
    }

    const totalInstructors = await this.userModel.countDocuments(query);
    const totalPages = Math.ceil(totalInstructors / limit);

    return {
      instructors: filteredInstructors,
      pagination: {
      currentPage: page,
      totalPages,
      totalInstructors,
      },
    };
  }

  public calculateAverageRatings(votes: number[]): number {
    const totalVotes = votes.reduce((sum, count) => sum + count, 0);
    if (totalVotes === 0) return 0;
  
    const weightedSum = votes.reduce((sum, count, index) => sum + count * (index + 1), 0);
    return parseFloat((weightedSum / totalVotes).toFixed(2));
  }
}
