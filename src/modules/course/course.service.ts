import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { Course } from '../../database/schemas/course.schema';
import { StudentCourse } from '../../database/schemas/studentCourse.schema';
import { User } from 'src/database/schemas/user.schema';
import { CreateCourseDto } from '../course/dto/CreateCourseDto';
import { UpdateCourseDto } from '../course/dto/UpdateCourseDto';
import { Type } from 'class-transformer';
import { ModuleEntity } from '../../database/schemas/module.schema';

@Injectable()
export class CourseService {
  constructor(
      @InjectModel(Course.name) private readonly courseModel: Model<Course>,
      @InjectModel(StudentCourse.name) private readonly studentCourseModel: Model<StudentCourse>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
      @InjectModel(ModuleEntity.name) private readonly moduleModel: Model<ModuleEntity>,
  ) {}
  /**
   * Retrieve all courses or search by name or instructor name with pagination
   * @param page Page number for pagination
   * @param limit Number of courses per page
   * @param name Optional course name filter
   * @param instructorName Optional instructor name filter
   * @returns List of filtered courses with pagination.
   */
  async getAllCourses(page: number, limit: number, name?: string, instructorName?: string): Promise<Course[]> {
    const query: Record<string, any> = {};

    if (name) {
      query.title = { $regex: name, $options: 'i' }; // Case-insensitive name match
    }
    if (instructorName) {
      const instructors = await this.userModel.find({ name: { $regex: instructorName, $options: 'i' } });
      if (!instructors || instructors.length === 0) throw new NotFoundException('Instructor not found');
      const instructorIds: Types.ObjectId[] = instructors.map(instructor => instructor._id as unknown as Types.ObjectId);
      query.instructor_id = { $in: instructorIds };
    }
    
    const courses = await this.courseModel
      .find(query)
      .skip((page - 1) * limit)
      .limit(limit);

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


  /**
   * Retrieves all courses for logged in instructor
   * @param userId ID of the instuctor logged in.
   * @returns List of all courses from this instructor.
   */

  async getInstructorCourse(userId: string) {
    const courses = await this.courseModel.find({instructor_id: new Types.ObjectId(userId)});
    return courses;
}

async addInstructorCourse(createCourseDto : CreateCourseDto, instructor_id: string) : Promise<Course> {

    const {category, description, difficulty_level, title} = createCourseDto;

    const duplicated = await this.courseModel.find({instructor_id: new Types.ObjectId(instructor_id), title: createCourseDto.title});

    if(duplicated.length)
      throw new BadRequestException('You have another course with this title')

    const newCourse = await this.courseModel.create({instructor_id: new Types.ObjectId(instructor_id), category, description, difficulty_level, title});

    return newCourse;
    
}

async updateInstructorCourse(updateCourseDto: UpdateCourseDto, instructor_id: string, id: string) : Promise<Course> {
    const course = await this.courseModel.findById(id);
    const instuctorIdObject = new Types.ObjectId(instructor_id);
    const duplicated = await this.courseModel.find({instructor_id: instuctorIdObject, title: updateCourseDto.title});

    if(duplicated.length)
      throw new BadRequestException('You have another course with this title')

    Object.assign(course, updateCourseDto);
    return await course.save()
}

  async getStudentCourses(userId: string) {
    const studentCourses = await this.studentCourseModel
      .find({ user_id: new Types.ObjectId(userId) })
      .populate('course_id');
  
    return studentCourses.map(studentCourse => studentCourse.course_id);
  }

  async getStudentCourseWithModules(courseId: string) {
    console.log('courseId', courseId);
    const course = await this.courseModel.findById(courseId);
    console.log('course', course);
    const modules = await this.moduleModel
      .find({ course_id: course._id })
      .select('-content -resources')
      .sort({ created_at: 1 });
  
    return {
      course,
      modules,
    };
  }

  async getStudentCoursesByStatus(userId: string, status: string) {
    const studentCourses = await this.studentCourseModel
      .find({ 
        user_id: new Types.ObjectId(userId),
        status: status 
      })
      .populate('course_id');

    if (!studentCourses || studentCourses.length === 0) {
      throw new NotFoundException(`No ${status} courses found for this student`);
    }

    return studentCourses.map(studentCourse => studentCourse.course_id);
  }
}
