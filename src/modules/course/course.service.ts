import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { Course } from '../../database/schemas/course.schema';
import { StudentCourse } from '../../database/schemas/studentCourse.schema';
import { CreateCourseDto } from '../course/dto/CreateCourseDto';
import { UpdateCourseDto } from '../course/dto/UpdateCourseDto';
import { Type } from 'class-transformer';

@Injectable()
export class CourseService {
  constructor(
    @InjectModel(Course.name) private readonly courseModel: Model<Course>,
    @InjectModel(StudentCourse.name) private readonly studentCourseModel: Model<StudentCourse>,
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

  /**
   * Retrieves all courses for logged in instructor
   * @param userId ID of the instuctor logged in.
   * @returns List of all courses from this instructor.
   */

  async getInstructorCourse(userId: string){

    const courses = await this.courseModel.find({instructorId: new Types.ObjectId(userId)});

    return courses;
}

async addInstructorCourse(createCourseDto : CreateCourseDto, instructor_id: string) : Promise<Course> {

    const {category, description, difficulty_level, title} = createCourseDto;

    const duplicated = await this.courseModel.find({instructorId: new Types.ObjectId(instructor_id), title: createCourseDto.title});

    if(duplicated.length)
      throw new BadRequestException('You have another course with this title')

    const newCourse = await this.courseModel.create({instructorId: new Types.ObjectId(instructor_id), category, description, difficulty_level, title});

    return newCourse;
    
}

async updateInstructorCourse(updateCourseDto: UpdateCourseDto, instructor_id: string, id: string) : Promise<Course> {

    const course = await this.courseModel.findById(id);

    const instuctorIdObject = new Types.ObjectId(instructor_id);

    if(!course)
        throw new NotFoundException('Course not found');

    const duplicated = await this.courseModel.find({instructorId: instuctorIdObject, title: updateCourseDto.title});

    if(duplicated.length)
      throw new BadRequestException('You have another course with this title')

    if(course.instructorId !== instuctorIdObject)
        throw new ForbiddenException('You don\'t have access to this course');

    Object.assign(course, updateCourseDto);

    return await course.save()

}
}
