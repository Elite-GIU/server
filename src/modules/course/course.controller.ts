import { Controller, Get, Param, UseGuards, Post, Body, InternalServerErrorException, Put } from '@nestjs/common';
import { CourseService } from './course.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InstructorGuard } from 'src/common/guards/instructor.guard';
import { CreateCourseDto } from '../auth/dto/CreateCourseDto';
import { UpdateCourseDto } from '../auth/dto/UpdateCourseDto';

@Controller('course')
@UseGuards(AuthGuard())
export class CourseController {
    constructor(private readonly courseService: CourseService) {}

    @Get('instuctor/courses')
    @UseGuards(JwtAuthGuard, InstructorGuard)
    async getInstructorCourses(@GetUser('userId') userId: string){

        return await this.courseService.getInstructorCourse(userId);

    }

    @Post('instructor/courses')
    @UseGuards(JwtAuthGuard, InstructorGuard)
    async addInstructorCourse(@Body() createCourseDto: CreateCourseDto, @GetUser('userId') userId : string){
 
       try {

         return await this.courseService.addInstructorCourse(createCourseDto, userId);

       }catch(error){
    
        throw new InternalServerErrorException('Course creation failed : ' + error.message);

       }

    }

    @Put('instructor/courses/:id')
    @UseGuards(JwtAuthGuard, InstructorGuard)
    async updateInstructorCourse(@Body() updateCourseDto : UpdateCourseDto, @Param('id') id: string, @GetUser('userId') userId: string){

        try {

            return await this.courseService.updateInstructorCourse(updateCourseDto, userId, id);

        }catch(error){

            throw new Error('Failed to update course: ' + error.message);
        }
    }

}
