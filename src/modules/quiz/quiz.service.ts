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

    const questionBank = await this.questionbankModel.findOne({ module_id: module_id }).exec();
    if (!questionBank) 
        throw new NotFoundException('No question bank found for this module');

    const questions = await this.questionModel.find({ _id: { $in: questionBank.questions } }).exec();
    if (!questions.length) 
        throw new NotFoundException('No questions found for this module');

    const avgGrade = await this.dashboardService.calculateAverageGrade(studentId, courseId);
    
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

    const quizResponse = await this.quizResponseModel.create({
        user_id: new Types.ObjectId(studentId),
        module_id: module_id,
        questions: selectedQuestions.map(q => q._id),
    })

    return {
        quizResponse,
        choices: selectedQuestions.map(q => q.choices)
    }
  }

  async submitQuiz(courseId: string, moduleId: string, submitQuizDto: SubmitQuizDto, studentId: string, quizResponseId: string) {
    if(submitQuizDto.answers.length !== submitQuizDto.questions.length)
        throw new BadRequestException('Please answer all questions before submitting.');

    const { questions } = submitQuizDto;
    let questionsIdObjectArray: Types.ObjectId[] = [];
    for(const question of questions){
        const question_id = new Types.ObjectId(question);
        questionsIdObjectArray.push(question_id);
    }

    const quizResponse_id = new Types.ObjectId(quizResponseId);
    await this.checkQuestionIds(questionsIdObjectArray, quizResponse_id);

    const submittedQuestions = await this.questionModel.find({ _id: { $in: questionsIdObjectArray } }).exec();

    const score = this.calculateQuizScore(submittedQuestions, submitQuizDto);

    await this.handleCompletionPercentage(studentId, moduleId, courseId, score);

    const quizResponse = await this.quizResponseModel.findByIdAndUpdate(
      quizResponse_id, 
      {
        answers: submitQuizDto.answers,
        score,
        finalGrade: score >= 50 ? 'passed' : 'failed'
      },
      { new: true }
    )

    return quizResponse;
  }

  async getQuizFeedback(quizResponseId: string) {
    const quizResponse_id = new Types.ObjectId(quizResponseId);
    const quizResponse = await this.quizResponseModel.findById(quizResponse_id).exec();

    const questionAnswerMap = new Map(
        quizResponse.questions.map((qId, index) => [qId.toString(), quizResponse.answers[index]])
    );

    const questions = await Promise.all(
        quizResponse.questions.map(qId => 
            this.questionModel.findById(qId).exec()
        )
    );

    const feedback = questions.map((question) => {
        const yourAnswer = questionAnswerMap.get(question._id.toString());
        const isCorrect = question.right_choice === yourAnswer;
        return {
            question: question.question,
            yourAnswer,
            correctAnswer: question.right_choice,
            isCorrect
        };
    });

    const module = await this.moduleModel.findById(quizResponse.module_id).exec();
    const message = quizResponse.score >= 50 ? 
        'You passed the quiz, well done!' : 
        `You failed the quiz, please study the ${module.title} module again`;

    return { score: quizResponse.score, feedback, message };
  }

  private calculateQuizScore(questions: Question[], submitQuizDto: SubmitQuizDto) {
    const questionMap = new Map(
        questions.map(q => [q._id.toString(), q])
    );

    let correctAnswers = 0;
    submitQuizDto.questions.forEach((questionId, index) => {
        const question = questionMap.get(questionId);
        if (question && question.right_choice === submitQuizDto.answers[index]) {
            correctAnswers++;
        }
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

  private async handleCompletionPercentage(studentId: string, moduleId: string, courseId: string, score: number) {
    const studentQuizResponses = await this.quizResponseModel.find({
        user_id: new Types.ObjectId(studentId),
        module_id: new Types.ObjectId(moduleId)
    }).exec();

    const passedQuizResponses = studentQuizResponses.filter(response => response.finalGrade === 'passed');

    if(score >= 50 && passedQuizResponses.length === 0) {
        await this.studentCourseModel.findOneAndUpdate({
            user_id: new Types.ObjectId(studentId),
            course_id: new Types.ObjectId(courseId)
        },
        {
            $inc: { completion_percentage: 1 },
            $push: { last_accessed: new Date() }
        });
    } else {
        await this.studentCourseModel.findOneAndUpdate({
            user_id: new Types.ObjectId(studentId),
            course_id: new Types.ObjectId(courseId)
        },
        {
            $push: { last_accessed: new Date() }
        });
    }
  }

  private async checkQuestionIds(questionsIdObjectArray: Types.ObjectId[], quizResponse_id: Types.ObjectId) {
    const quizResponseQuestions = await this.quizResponseModel.findById(quizResponse_id).exec();

    for (let i = 0; i < questionsIdObjectArray.length; i++) {
      if (!questionsIdObjectArray[i].equals(quizResponseQuestions.questions[i])) {
        throw new BadRequestException('Questions submitted do not match the original quiz');
      }
    }
  }
}
