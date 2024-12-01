import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Course } from 'src/database/schemas/course.schema';
import { ModuleEntity } from 'src/database/schemas/module.schema';
import { QuizResponse } from 'src/database/schemas/quizResponse.schema';
import { StudentCourse } from 'src/database/schemas/studentCourse.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(StudentCourse.name) private readonly studentCourseModel: Model<any>,
    @InjectModel(QuizResponse.name) private readonly quizResponseModel: Model<any>,
    @InjectModel(Course.name) private readonly coursesModel: Model<any>,
    @InjectModel(ModuleEntity.name) private readonly modulesModel: Model<any>,
  ) {}

  async getStudentDashboard(userId: string) {
    const objId = new Types.ObjectId(userId);
    const courses = await this.studentCourseModel.find({ user_id: objId }).populate('course_id');

    const courseDetailsPromises = courses.map(async (course) => {
      const averageGrade = await this.calculateAverageGrade(userId, course.course_id._id);
      const lastAccessed = course.last_accessed[course.last_accessed.length - 1];
      const accessedLastMonth = this.accessedInLastMonth(course.last_accessed);

      return {
        courseId: course.course_id._id,
        courseName: course.course_id.title,
        progress: course.completion_percentage,
        averageGrade: averageGrade, 
        lastAccessed: lastAccessed,
        accessedLastMonth: accessedLastMonth,
      };
    });

    const courseDetails = await Promise.all(courseDetailsPromises);
    return courseDetails;
  }

  async getStudentQuizzes(userId: string) {
    const quizzes = await this.quizResponseModel
    .find({ user_id: new Types.ObjectId(userId) })
    .populate({ path: 'module_id', populate: { path: 'course_id' } })  
    .sort({ createdAt: -1 });  
    return quizzes.map((quiz) => ({
        quizId: quiz._id,
        grade: quiz.score,
        courseName: quiz.module_id?.course_id?.title,  
        moduleName: quiz.module_id?.title,  
        dateTaken: quiz.createdAt,  
    }));
  }
  

  async getInstructorDashboard(instructorId: string) {
    const courses = await this.coursesModel.find({ instructor_id: new Types.ObjectId(instructorId) });
    const courseDetails = await this.getCourseDetails(courses);
    return courseDetails;
  }

  async getInstructorCourseDashboard(courseId: string) {
    const modules = await this.modulesModel.find({ course_id: new Types.ObjectId(courseId) });
    const moduleDetails = await this.getModuleDetails(modules);
    return moduleDetails;
  }

  async getInstructorCourseStudents(
    courseId: string,
    page: number,
    limit: number,
    name: string
  ) {
    const allStudents = await this.studentCourseModel
      .find({ course_id: new Types.ObjectId(courseId) })
      .populate('user_id');
  
    const filteredStudents = name
      ? allStudents.filter(student =>
          student.user_id.name.toLowerCase().includes(name.toLowerCase())
        )
      : allStudents;
  
    const paginatedStudents = filteredStudents.slice(
      (page - 1) * limit,
      page * limit
    );
  
    const studentsPromise = paginatedStudents.map(async student => ({
      studentId: student.user_id._id,
      studentName: student.user_id.name,
      averageGrade: await this.calculateAverageGrade(student.user_id._id, courseId),
    }));
  
    return await Promise.all(studentsPromise);
  }
  


  private accessedInLastMonth(accessedDates: Date[]) {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const accessesLastMonth = accessedDates.filter((date) => new Date(date) >= oneMonthAgo);
    return accessesLastMonth.length;
  }

  private async getCourseDetails(courses: any[]) {
    const courseDetails = [];
  
    for (const course of courses) {
      const studentCount = await this.studentCourseModel.countDocuments({ course_id: course._id });
      const studentCompletedCourse = await this.studentCourseModel.countDocuments({ course_id: course._id, completion_percentage: 100 });
      const segmentedStudents = await this.segmentStudentsPerCourse(course._id);

      courseDetails.push({
        courseId: course._id,
        courseName: course.title,
        description: course.description, 
        studentCount: studentCount,
        studentsCompletedCourse: studentCompletedCourse,
        performanceMetrics: segmentedStudents
      });
    }
  
    return courseDetails;
  }

  private async segmentStudentsPerCourse(courseId: string) {
    const students = await this.studentCourseModel.find({ course_id: courseId });

    const segmentation = {
      belowAverage: 0,
      average: 0,
      aboveAverage: 0,
      excellent: 0,
    };

    for (const student of students) {
      const averageGrade = await this.calculateAverageGrade(student.user_id, courseId);
  
      if (averageGrade < 50) {
        segmentation.belowAverage++;
      } else if (averageGrade >= 50 && averageGrade < 75) {
        segmentation.average++;
      } else if (averageGrade >= 75 && averageGrade < 90) {
        segmentation.aboveAverage++;
      } else if (averageGrade >= 90) {
        segmentation.excellent++;
      }
    }
  
    return segmentation;
  }
  

  private async getModuleDetails(modules: any[]) {
    const moduleDetails = [];
  
    for (const module of modules) {
      const quizzes = await this.quizResponseModel.find({ module_id: module._id });

      const grades = quizzes.map((quiz) => quiz.score);

      moduleDetails.push({
        moduleId: module._id,
        moduleName: module.title,
        averageGrade: this.calculateAverage(grades),
        bestGrade: Math.max(...grades),
        lowestGrade: Math.min(...grades),
      });
    }
  
    return moduleDetails;
  }


  public async calculateAverageGrade(userId: string, courseId: string) {
    const quizzes = await this.getStudentQuizzesPerCourse(userId, courseId);
    const grades = quizzes.map((quiz) => quiz.score || 0);
    return this.calculateAverage(grades);
  }

  private async getStudentQuizzesPerCourse(userId: string, courseId: string){
    const modules = await this.modulesModel.find({ course_id: new Types.ObjectId(courseId) }, { _id: 1 });
    const moduleIds = modules.map((module) => module._id);
    const quizzes = await this.quizResponseModel.find({
        user_id: new Types.ObjectId(userId),
        module_id: { $in: moduleIds },
    });
    return quizzes;
  }

  private calculateAverage(grades: number[]) {
    if (grades.length === 0) return 0;
    return grades.reduce((sum, grade) => sum + grade, 0) / grades.length;
  }

}

