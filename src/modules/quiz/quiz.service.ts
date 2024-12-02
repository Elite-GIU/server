import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ModuleEntity } from 'src/database/schemas/module.schema';
import { QuizResponse } from 'src/database/schemas/quizResponse.schema';
import { Question } from '../../database/schemas/question.schema';
import { Questionbank } from '../../database/schemas/questionbank.schema';
import { DashboardService } from '../dashboard/dashboard.service';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { StudentCourse } from 'src/database/schemas/studentCourse.schema';

@Injectable()
export class QuizService {
  constructor(
    @InjectModel(ModuleEntity.name) private readonly moduleModel: Model<any>,
    @InjectModel(Question.name) private readonly questionModel: Model<Question>,
    @InjectModel(Questionbank.name) private readonly questionbankModel: Model<Questionbank>,
    @InjectModel(QuizResponse.name) private readonly quizResponseModel: Model<any>,
    @InjectModel(StudentCourse.name) private readonly studentCourseModel: Model<StudentCourse>,
    
    private readonly dashboardService: DashboardService,
  ) {}

  async generateQuiz(courseId: string, moduleId: string, studentId: string) {
    const module_id = new Types.ObjectId(moduleId);
    const module = await this.moduleModel.findById(module_id);
    if (!module) 
        throw new NotFoundException('Module not found');

    const questionBank = await this.questionbankModel.findOne({ module_id: module_id }).exec();
    if (!questionBank) 
        throw new NotFoundException('No question bank found for this module');

    const questions = await this.questionModel.find({ _id: { $in: questionBank.questions } }).exec();
    if (!questions.length) 
        throw new NotFoundException('No questions found for this module');

    const avgGrade = await this.dashboardService.calculateAverageGrade(courseId, studentId);
    
    let targetDifficulty: number;
    if (avgGrade < 50) targetDifficulty = 1;
    else if (avgGrade < 70) targetDifficulty = 2;
    else targetDifficulty = 3;

    let eligibleQuestions = this.filterQuestionsByDifficulty(questions, targetDifficulty);
    if (module.assessmentType !== 'mix') {
      eligibleQuestions = this.filterQuestionsByType(eligibleQuestions, module.assessmentType);
    }

    const selectedQuestions = this.getRandomQuestions(
      eligibleQuestions, 
      module.numberOfQuestions
    );

    return {
        user_id: studentId,
        module_id: module_id,
        questions: selectedQuestions.map(q => q._id),
        choices: selectedQuestions.map(q => q.choices)
    }
  }

  async submitQuiz(courseId: string, moduleId: string, submitQuizDto: SubmitQuizDto, studentId: string) {
    if(submitQuizDto.answers.length !== submitQuizDto.questions.length)
        throw new BadRequestException('Please answer all questions before submitting.');

    const { questions } = submitQuizDto;
    let questionsIdObjectArray: Types.ObjectId[] = [];
    for(const question of questions){
        const question_id = new Types.ObjectId(question);
        questionsIdObjectArray.push(question_id);
    }
    const submittedQuestions = await this.questionModel.find({ _id: { $in: questionsIdObjectArray } }).exec();

    const score = this.calculateQuizScore(submittedQuestions, submitQuizDto);

    const quizResponse = await this.quizResponseModel.create({
        user_id: new Types.ObjectId(studentId),
        module_id: new Types.ObjectId(moduleId),
        questions: questionsIdObjectArray,
        answers: submitQuizDto.answers,
        score,
        finalGrade: score >= 50 ? 'passed' : 'failed'
    })

    if(score >= 50) {
        await this.studentCourseModel.findOneAndUpdate({
            user_id: new Types.ObjectId(studentId),
            course_id: new Types.ObjectId(courseId)
        }, 
        {
            $inc: { completion_percentage: 1 },
            $push: { last_accessed: new Date() }
        }
        );
    }

    return quizResponse;
  }

  async getQuizFeedback(moduleId: string, studentId: string, quizResponseId: string) {
    const module_id = new Types.ObjectId(moduleId);
    const user_id = new Types.ObjectId(studentId);
    const quizResponse_id = new Types.ObjectId(quizResponseId);

    const quizResponse = await this.quizResponseModel.findById(quizResponse_id).exec();
    
    if(!quizResponse) 
        throw new NotFoundException('No quiz response found for this module');

    const questions = await this.questionModel.find({
        _id: { $in: quizResponse.questions }
    }).exec();

    const feedback = questions.map((question, index) => {
        const isCorrect = question.right_choice === quizResponse.answers[index];
        return {
            question: question.question,
            yourAnswer: quizResponse.answers[index],
            correctAnswer: question.right_choice,
            isCorrect
        }
    });

    const module = await this.moduleModel.findById(moduleId).exec();
    const message = quizResponse.score >= 50? 
        'You passed the quiz, well done!' : `You failed the quiz, please study the ${module.title} module again`;

    return { score: quizResponse.score, feedback, message };
  }

  private calculateQuizScore(questions: Question[], submitQuizDto: SubmitQuizDto) {
    let correctAnswers = 0;
    questions.forEach((question, index) => {
        if(question.right_choice === submitQuizDto.answers[index])
            correctAnswers++;
    });

    return (correctAnswers / questions.length) * 100;
  }

  private getRandomQuestions(questions: any[], count: number) {
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, questions.length));
  }

  private filterQuestionsByDifficulty(questions: Question[], targetDifficulty: number) {
    return questions.filter(q => q.difficulty === targetDifficulty);
  }

  private filterQuestionsByType(questions: Question[], type: string) {
    return questions.filter(q => q.type === type);
  }
}
