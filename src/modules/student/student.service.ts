import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Course } from '../../database/schemas/course.schema';
import { User } from '../../database/schemas/user.schema';

@Injectable()
export class StudentService {
  constructor(
    @InjectModel(Course.name) private readonly courseModel: Model<Course>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async getLearningPath(userId: string) {
    // Validate user existence
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    // Match courses based on user preferences and exclude already enrolled courses
    const courses = await this.courseModel.aggregate([
      {
        $match: {
          category: { $in: user.preferences }, // Match user preferences
        },
      },
      {
        $lookup: {
          from: 'studentcourses', // Lookup from studentcourses collection
          let: { courseId: '$_id' }, // Pass course `_id` to the pipeline
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$course_id', '$$courseId'] }, // Match course ID
                    { $eq: ['$user_id', new Types.ObjectId(userId)] }, // Match student ID
                  ],
                },
              },
            },
          ],
          as: 'enrollments', 
        },
      },
      {
        $match: {
          enrollments: { $size: 0 }, // Exclude already enrolled courses
        },
      },
      {
        $sort: { difficulty_level: 1 }, // Sort by difficulty level
      },
    ]);

    return courses;
  }

  async deleteStudent(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user || user.role!='student' || user.isActive==false) 
      throw new NotFoundException('Student not found');

    user.isActive = false;
    await user.save();

    return {
      statusCode: HttpStatus.OK,
      message: 'Student deleted successfully',
    };
  }

  async getAllStudents(page: number, limit: number, name?: string) {
    const query: Record<string, any> = { role: "student" };
  
    if (name) {
      query.name = { $regex: name, $options: "i" };
    }
 
    const students = await this.userModel
      .find(query, { _id: 1, name: 1, email: 1, isActive: 1 }) 
      .skip((page - 1) * limit)
      .limit(limit);

    const totalStudents = await this.userModel.countDocuments(query);
    const totalPages = Math.ceil(totalStudents / limit);

    if (!students || students.length === 0) {
      throw new NotFoundException("No students found");
    }
  
    return {
      students,
      pagination: {
        currentPage: page,
        totalPages,
        totalStudents,
      },
    };
  }

  
  
  

}
