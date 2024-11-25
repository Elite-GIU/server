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

  async assignStudentToCourse(studentIdentifier: string, courseId: string): Promise<StudentCourse> {
    // Verify the course exists
    const course = await this.courseModel.findById(courseId);
    if (!course) throw new NotFoundException('Course not found');
  
    // Verify the student exists by ID or email
    const student = await this.userModel.findOne({
      $or: [{ _id: studentIdentifier }, { email: studentIdentifier }],
    });
    if (!student) throw new NotFoundException('Student not found');
  
    // Check if the student is already assigned to the course
    const existingAssignment = await this.studentCourseModel.findOne({
      course_id: course._id,
      user_id: student._id,
    });
    if (existingAssignment) throw new BadRequestException('Student already assigned to this course');
  
    // Assign the student to the course
    const studentCourse = await this.studentCourseModel.create({
      course_id: course._id,
      user_id: student._id,
      completion_percentage: 0, // Defaults to 0 as it's a new assignment
      last_accessed: [], // Initialize as an empty array
    });
  
    return studentCourse;
  }
  
}
