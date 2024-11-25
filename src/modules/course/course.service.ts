import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course } from '../../database/schemas/course.schema';
import { StudentCourse } from '../../database/schemas/studentCourse.schema';
import { ModuleEntity } from '../../database/schemas/module.schema';
import { CreateCourseDto } from '../auth/dto/CreateCourseDto';
import { UpdateCourseDto } from '../auth/dto/UpdateCourseDto';

@Injectable()
export class CourseService {
    constructor(
        @InjectModel(Course.name) private readonly courseModel: Model<Course>,
        @InjectModel(StudentCourse.name) private readonly studentCourseModel: Model<StudentCourse>,
        @InjectModel(ModuleEntity.name) private readonly moduleModel: Model<ModuleEntity>,
    ) {}


    async getInstructorCourse(userId: string){

        const courses = await this.courseModel.find({instructor_id: userId});

        return courses;
    }

    async addInstructorCourse(createCourseDto : CreateCourseDto, instructor_id: string) : Promise<Course> {

        const {category, description, difficulty_level} = createCourseDto;

        const newCourse = await this.courseModel.create({instructor_id, category, description, difficulty_level});

        return newCourse;
        
    }

    async updateInstructorCourse(updateCourseDto: UpdateCourseDto, instructor_id: string, id: string) : Promise<Course> {

        const course = await this.courseModel.findById(id);

        if(!course)
            throw new NotFoundException('Course not found');

        if(course.instructor_id !== instructor_id)
            throw new ForbiddenException('You don\'t have access to this course');

        const {category, description, difficulty_level} = updateCourseDto;

        const updatedCourse = await course.updateOne(updateCourseDto);

        return updatedCourse;

    }
}
