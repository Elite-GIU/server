import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';
import { Model, Types } from 'mongoose';
import { Course } from '../../database/schemas/course.schema';
import { ModuleEntity } from '../../database/schemas/module.schema';
import { QuizResponse } from '../../database/schemas/quizResponse.schema';
import { StudentCourse } from '../../database/schemas/studentCourse.schema';
import { User } from '../../database/schemas/user.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(StudentCourse.name) private readonly studentCourseModel: Model<any>,
    @InjectModel(QuizResponse.name) private readonly quizResponseModel: Model<any>,
    @InjectModel(Course.name) private readonly coursesModel: Model<any>,
    @InjectModel(ModuleEntity.name) private readonly modulesModel: Model<any>,
    @InjectModel(User.name) private readonly userModel: Model<any>,
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
        finalGrade: quiz.finalGrade
    }));
  }
  

  async getInstructorDashboard(instructorId: string) {
    const courses = await this.coursesModel.find({ instructor_id: new Types.ObjectId(instructorId) });
    const courseDetails = await this.getCourseDetails(courses);
    return courseDetails;
  }

  async getInstructorDashboardReport(instructorId: string, res: Response) {
    try {
      const courses = await this.coursesModel.find({ instructor_id: new Types.ObjectId(instructorId) });
      const courseDetails = await this.getCourseDetails(courses);

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Instructor Dashboard');

      worksheet.addRow([
        'Course ID',
        'Course Name',
        'Description',
        'Student Count',
        'Students Completed Course',
        'Average Grade',
        'Below Average Count',
        'Average Count',
        'Above Average Count',
        'Excellent Count'
      ]);

      courseDetails.forEach((course) => {
        worksheet.addRow([
          course.courseId,
          course.courseName,
          course.description,
          course.studentCount,
          course.studentsCompletedCourse,
          course.averageGrade,
          course.performanceMetrics.belowAverage, 
          course.performanceMetrics.average,
          course.performanceMetrics.aboveAverage,
          course.performanceMetrics.excellent,
        ]);
      });

      const buffer = await workbook.xlsx.writeBuffer();
      res.header('Content-Disposition', 'attachment; filename=InstructorReport.xlsx');
      res.type('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.send(buffer);
    } catch (error) {
      throw new Error('Error generating Excel file: ' + error.message);
    }
  }
  

  async getInstructorCourseDashboard(courseId: string) {
    const modules = await this.modulesModel.find({ course_id: new Types.ObjectId(courseId), isDeleted:false });
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
    const activeStudents = allStudents.filter(student => student.user_id.isActive === true);

    const filteredStudents = name
      ? activeStudents.filter(student =>
          student.user_id.name.toLowerCase().includes(name.toLowerCase())
        )
      : activeStudents;

    const totalStudents = filteredStudents.length;
    const totalPages = Math.ceil(totalStudents / limit);
    
    const paginatedStudents = filteredStudents.slice(
      (page - 1) * limit,
      page * limit
    );
    
    const studentsPromise = paginatedStudents.map(async student => ({
      studentId: student.user_id._id,
      studentName: student.user_id.name,
      averageGrade: await this.calculateAverageGrade(student.user_id._id, courseId),
    }));

    const students = await Promise.all(studentsPromise);

    return {
      students,
      pagination: {
        currentPage: page,
        totalPages,
        totalStudents,
      },
    };
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
      const averageGrade = await this.getCourseAverageGrade(course._id);
      const averageRate = await this.calculateAverageRatings(course.ratings||[]);

      courseDetails.push({
        courseId: course._id,
        courseName: course.title,
        description: course.description, 
        studentCount: studentCount,
        studentsCompletedCourse: studentCompletedCourse,
        averageGrade: averageGrade,
        performanceMetrics: segmentedStudents,
        averageRatings: averageRate
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
      const ratings = module.ratings || [];

      moduleDetails.push({
        moduleId: module._id,
        moduleName: module.title,
        averageGrade: this.calculateAverage(grades),
        bestGrade: grades.length > 0 ? Math.max(...grades) : 0,
        lowestGrade: grades.length > 0 ? Math.min(...grades) : 0,
        averageRating: this.calculateAverageRatings(ratings),
      });
    }
  
    return moduleDetails;
  }

  public calculateAverageRatings(votes: number[]): number {
    const totalVotes = votes.reduce((sum, count) => sum + count, 0);
    if (totalVotes === 0) return 0;
  
    const weightedSum = votes.reduce((sum, count, index) => sum + count * (index + 1), 0);
    return parseFloat((weightedSum / totalVotes).toFixed(2));
  }
  

  async getCourseAverageGrade(courseId: string) {
    try {
      const modules = await this.modulesModel.find({ course_id: new Types.ObjectId(courseId), isDeleted:false });

      if (!modules || modules.length === 0) {
        return 0;
      }

      const moduleIds = modules.map((module) => module._id);

      const quizzes = await this.quizResponseModel.find({
        module_id: { $in: moduleIds }
      });

      if (!quizzes || quizzes.length === 0) {
        return 0;
      }

      const grades = quizzes.map((quiz) => quiz.score || 0);
      const total = grades.reduce((sum, grade) => sum + grade, 0);
      const average = total / grades.length;

      return average;
    } catch (error) {
      throw new Error('Error calculating average grade: ' + error.message);
    }
  }


  public async calculateAverageGrade(userId: string, courseId: string) {
    const highestQuizzes = await this.getHighestStudentQuizzesByCourse(userId, courseId);

    const grades = highestQuizzes
      .map((entry) => entry.highestQuiz?.score || 0);

    return this.calculateAverage(grades);
  }

  public async getHighestStudentQuizzesByCourse(userId: string, courseId: string) {
    const modules = await this.modulesModel.find(
      { course_id: new Types.ObjectId(courseId), isDeleted: false },
      { _id: 1 }
    );
  
    const highestScores = await Promise.all(
      modules.map(async (module) => {
        const topQuizResponse = await this.quizResponseModel
          .find({
            user_id: new Types.ObjectId(userId),
            module_id: module._id,
          })
          .sort({ score: -1 })
          .limit(1);

        if (topQuizResponse.length > 0) {
          return {
            moduleId: module._id,
            highestQuiz: topQuizResponse[0],
          };
        }
  
        return null; 
      })
    );

    return highestScores.filter((score) => score !== null);
  }
  
  private calculateAverage(grades: number[]) {
    if (grades.length === 0) return 0;
    return grades.reduce((sum, grade) => sum + grade, 0) / grades.length;
  }

  async getInstructorMetrics(instructorId: string) {
    const courses = await this.coursesModel.find({ instructor_id: new Types.ObjectId(instructorId) });

    if (!courses.length) {
      return { error: 'No courses found for the given instructor.' };
    }

    let highestRatedCourse = null;
    let studentWithHighestGrade = null;
    let courseWithHighestAverageGrade = null;
    let courseWithMostStudents = null;

    let maxRating = -1;
    let maxGrade = -1;
    let maxAverageGrade = -1;
    let maxStudents = -1;

    for (const course of courses) {
      const { _id: courseId, title } = course;

      // 1. Calculate the highest-rated course
      const averageRating = await this.calculateAverageRatings(course.ratings || []);
      if (averageRating > maxRating) {
        maxRating = averageRating;
        highestRatedCourse = { courseId, title, averageRating };
      }

      // 2. Find the student with the highest grade
      const students = await this.studentCourseModel.find({ course_id: courseId });

      for (const student of students) {
        const averageGrade = await this.calculateAverageGrade(student.user_id, courseId);
        if (averageGrade > maxGrade) {
          maxGrade = averageGrade;

          // Fetch student name
          const user = await this.userModel.findById(student.user_id);

          studentWithHighestGrade = {
            studentId: student.user_id,
            studentName: user?.name, // Assumes 'name' field exists in User model
            grade: averageGrade,
            courseId,
            courseName: title,
          };
        }
      }

      // 3. Find the course with the highest average grade
      const courseAverageGrade = await this.getCourseAverageGrade(courseId);
      if (courseAverageGrade > maxAverageGrade) {
        maxAverageGrade = courseAverageGrade;
        courseWithHighestAverageGrade = { courseId, title, averageGrade: courseAverageGrade };
      }

      // 4. Find the course with the greatest number of students
      const studentCount = await this.studentCourseModel.countDocuments({ course_id: courseId });
      if (studentCount > maxStudents) {
        maxStudents = studentCount;
        courseWithMostStudents = { courseId, title, studentCount };
      }
    }


    return {
      highestRatedCourse,
      studentWithHighestGrade,
      courseWithHighestAverageGrade,
      courseWithMostStudents,
    };
  }

}

