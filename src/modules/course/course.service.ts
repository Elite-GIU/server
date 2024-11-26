import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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


  /**
   * Allows a student to assign themselves to a course.
   * @param courseId ID of the course to assign the student to.
   * @param studentId ID of the student assigning themselves.
   * @returns Enrollment record for the student.
   */
  async assignStudentToCourse(courseId: string, studentId: string): Promise<StudentCourse> {
    // Validate if the course exists
    const course = await this.courseModel.findById(courseId);
    if (!course) {
      throw new NotFoundException(`Course with ID "${courseId}" not found`);
    }

    // Check if the student is already enrolled
    const existingEnrollment = await this.studentCourseModel.findOne({
      user_id: studentId,
      course_id: courseId,
    });

    if (existingEnrollment) {
      throw new BadRequestException('Student is already assigned to this course');
    }

    // Create a new enrollment
    const enrollment = await this.studentCourseModel.create({
      user_id: studentId,
      course_id: courseId,
      completion_percentage: 0,
      last_accessed: [],
    });

    return enrollment;
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

  async getStudentCoursesByStatus(userId: string, status: string) {
    const studentCourses = await this.studentCourseModel
      .find({ 
        user_id: userId,
        status: status 
      })
      .populate('course_id');

    if (!studentCourses || studentCourses.length === 0) {
      throw new NotFoundException(`No ${status} courses found for this student`);
    }

    return studentCourses.map(studentCourse => studentCourse.course_id);
  }
}
