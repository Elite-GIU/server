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
import { CourseArchive } from 'src/database/schemas/course.archive.schema';
import { AddRatingDto } from './dto/AddRatingDto';

@Injectable()
export class CourseService {
  constructor(
      @InjectModel(Course.name) private readonly courseModel: Model<Course>,
      @InjectModel(CourseArchive.name) private readonly courseArchiveModel: Model<CourseArchive>,
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
  async getAllCourses(page: number, limit: number, name?: string, instructorName?: string){
    const query: Record<string, any> = {};

    if (name) {
      query.$or = [
      { title: { $regex: name, $options: 'i' } }, // Case-insensitive name match
      { keywords: { $regex: name, $options: 'i' } } // Case-insensitive match in keywords array
      ];
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

    const totalCourses = await this.courseModel.countDocuments(query);
    const totalPages = Math.ceil(totalCourses / limit);
    
    return {courses,
      pagination: {
        currentPage: page,
        totalPages,
        totalCourses,
      },
    };
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
    if(!student.isActive) throw new ForbiddenException('Student is deleted');
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

    const duplicated = await this.courseModel.find({instructor_id: new Types.ObjectId(instructor_id), title: createCourseDto.title});

    if(duplicated.length)
      throw new BadRequestException('You have another course with this title')

    const newCourse = await this.courseModel.create({instructor_id: new Types.ObjectId(instructor_id), ...createCourseDto});

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
    const course = await this.courseModel.findById(courseId);
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

  async deleteInstructorCourse(id: string, userId: string){

    const course = await this.courseModel.findById(id);

    if(!course)
      throw new Error('Course not found');

    //archive the course
    if(!course.instructor_id.equals(userId))
      throw new Error('Unauthorized');

    const newCourse = course.toObject();

    delete newCourse._id;

    await this.courseArchiveModel.create({...newCourse, instructor_id: userId});

    const deleted = await this.courseModel.findByIdAndDelete(id);

    return deleted;
  }

  async deleteCourse(id: string){

    const course = await this.courseModel.findById(id);

    if(!course)
      throw new Error('Course not found');

    const newCourse = course.toObject();

    delete newCourse._id;

    await this.courseArchiveModel.create({...newCourse, instructor_id: course.instructor_id});

    const deleted = await this.courseModel.findByIdAndDelete(id);

    return deleted;
  }

  async rateCourse(courseId: string, ratingDto: AddRatingDto) {
    const { course_rate, instructor_rate } = ratingDto;

    let updatedCourse = null;
    if (course_rate) {
      const courseRatingIndex = course_rate - 1;
      updatedCourse = await this.courseModel.findByIdAndUpdate(
        courseId,
        {
          $inc: { [`ratings.${courseRatingIndex}`]: 1 },
        },
        { new: true }, 
      );
    }
  
    let updatedInstructor = null;
    if (instructor_rate) {
      const course = await this.courseModel.findById(courseId);
      const instructorId = course.instructor_id;
  
      const instructorRatingIndex = instructor_rate - 1; 
      updatedInstructor = await this.userModel.findByIdAndUpdate(
        instructorId,
        {
          $inc: { [`ratings.${instructorRatingIndex}`]: 1 },
        },
        { new: true }, 
      );
    }

    return {
      updatedCourse,
      updatedInstructor,
    };
  }

  async getAllCoursesAdminPage(page: number, limit: number, name?: string, instructorName?: string):Promise<any>{
    const query: Record<string, any> = {};

  if (name) {
    query.$or = [
      { title: { $regex: name, $options: 'i' } }, 
      { keywords: { $regex: name, $options: 'i' } },
      { category: { $regex: name, $options: 'i' } } 
    ];
  }

  if (instructorName) {
    const instructors = await this.userModel.find({ name: { $regex: instructorName, $options: 'i' } });
    if (!instructors || instructors.length === 0) throw new NotFoundException('Instructor not found');
    const instructorIds: Types.ObjectId[] = instructors.map(instructor => instructor._id as unknown as Types.ObjectId);
    query.instructor_id = { $in: instructorIds };
  }

  const normalCourses = await this.courseModel.find(query).lean(); 
  const archivedCourses = await this.courseArchiveModel.find(query).lean();

  const normalCoursesWithFlag = normalCourses.map(course => ({
    ...course,
    isArchived: false,
  }));
  const archivedCoursesWithFlag = archivedCourses.map(course => ({
    ...course,
    isArchived: true,
  }));

  const allCourses = [...normalCoursesWithFlag, ...archivedCoursesWithFlag];

  if (allCourses.length === 0) {
    throw new NotFoundException('No courses available');
  }

  const totalCourses = allCourses.length;
  const totalPages = Math.ceil(totalCourses / limit);
  const paginatedCourses = allCourses.slice((page - 1) * limit, page * limit);

  return {
    courses: paginatedCourses,
    pagination: {
      currentPage: page,
      totalPages,
      totalCourses,
    },
  };
  }
  
}
