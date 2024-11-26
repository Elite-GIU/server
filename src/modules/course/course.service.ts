import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course } from '../../database/schemas/course.schema';
import { StudentCourse } from '../../database/schemas/studentCourse.schema';
import { User } from 'src/database/schemas/user.schema';

@Injectable()
export class CourseService {
  constructor(
    @InjectModel(Course.name) private readonly courseModel: Model<Course>,
    @InjectModel(StudentCourse.name) private readonly studentCourseModel: Model<StudentCourse>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  /**
   * Retrieves all available courses.
   * @returns List of all courses.
   */
  async getAllCourses(): Promise<Course[]> {
    const courses = await this.courseModel.find();
    if (!courses || courses.length === 0) {
      throw new NotFoundException('No courses available');
    }
    return courses;
  }

  async assignStudentToCourse(courseId: string, studentIdentifier: string): Promise<StudentCourse> {
    // Verify the course exists
    const course = await this.courseModel.findById(courseId);
    if (!course) throw new NotFoundException('Course not found');
    //check if studentIdentifier is a valid email then get the student by email else get the student by id in 2 steps
    let student;
    if (studentIdentifier.includes('@')) {
      student = await this.userModel.findOne({ email: studentIdentifier });
    } else {
      student = await this.userModel.findById(studentIdentifier);
    }
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

  /**
   * Retrieves courses filtered by name or instructor.
   * @param filters Object containing optional name and instructor filters.
   * @returns List of filtered courses.
   */
  async getCourses(filters: { name?: string; instructor?: string }): Promise<Course[]> {
    const query: Record<string, any> = {};

    if (filters.name) {
      query.name = { $regex: filters.name, $options: 'i' }; // Case-insensitive name match
    }

    if (filters.instructor) {
      query.instructor = { $regex: filters.instructor, $options: 'i' }; // Case-insensitive instructor match
    }

    const courses = await this.courseModel.find(query);

    if (!courses || courses.length === 0) {
      throw new NotFoundException('No courses found matching the criteria.');
    }

    return courses;
  }
}
