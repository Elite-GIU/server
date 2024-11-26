import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { StudentCourse } from 'src/database/schemas/studentCourse.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel('StudentCourse') private readonly studentCourseModel: Model<any>,
    @InjectModel('QuizResponse') private readonly quizResponseModel: Model<any>,
    @InjectModel('Course') private readonly coursesModel: Model<any>,
    @InjectModel('Module') private readonly modulesModel: Model<any>,
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
        courseName: course.course_id.name,
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
        courseName: quiz.module_id?.course_id?.name,  
        moduleName: quiz.module_id?.title,  
        dateTaken: quiz.createdAt,  
    }));
  }
  

  async getInstructorDashboard(instructorId: string) {
    const courses = await this.coursesModel.find({ instructorId: instructorId });
    const courseDetails = await this.getCourseDetails(courses);
    return courseDetails;
  }

  async getInstructorCourseDashboard(courseId: string) {
    const modules = await this.modulesModel.find({ course_id: courseId });
    const moduleDetails = await this.getModuleDetails(modules);
    return moduleDetails;
  }

  async getInstructorCourseStudents(courseId: string, page: number, limit: number) {
    const students = await this.studentCourseModel
      .find({ course_id: courseId })
      .populate('user_id')
      .skip((page - 1) * limit)
      .limit(limit);
    return students.map((student) => ({
      studentId: student.user_id._id,
      studentName: student.user_id.name,
      averageGrade: this.calculateAverageGrade(student.user_id._id, courseId),
    }));
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
      
      courseDetails.push({
        courseId: course._id,
        description: course.description, 
        studentCount: studentCount
      });
    }
  
    return courseDetails;
  }

  private async getModuleDetails(modules: any[]) {
    const moduleDetails = [];
  
    for (const module of modules) {
      const quizzes = await this.quizResponseModel.find({ 'questions.module_id': module._id });

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


  private async calculateAverageGrade(userId: string, courseId: string) {
    const quizzes = await this.getStudentQuizzesPerCourse(userId, courseId);
    const grades = quizzes.map((quiz) => quiz.score || 0);
    return this.calculateAverage(grades);
  }

  private async getStudentQuizzesPerCourse(userId: string, courseId: string){
    const modules = await this.modulesModel.find({ course_id: courseId }, { _id: 1 });
    const moduleIds = modules.map((module) => module._id);
    const quizzes = await this.quizResponseModel.find({
        user_id: new Types.ObjectId(userId),
        module_id: { $in: moduleIds },
    });
    console.log(quizzes);
    return quizzes;
  }

  private calculateAverage(grades: number[]) {
    if (grades.length === 0) return 0;
    return grades.reduce((sum, grade) => sum + grade, 0) / grades.length;
  }

}

