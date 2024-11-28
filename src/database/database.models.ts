import { MongooseModule } from '@nestjs/mongoose';
import { Content, ContentSchema } from './schemas/content.schema';
import { Course, CourseSchema } from './schemas/course.schema';
import { Log, LogSchema } from './schemas/log.schema';
import { ModuleEntity, ModuleSchema } from './schemas/module.schema';
import { Notification, NotificationSchema } from './schemas/notification.schema';
import { Question, QuestionSchema } from './schemas/question.schema';
import { Questionbank, QuestionbankSchema } from './schemas/questionbank.schema';
import { QuizResponse, QuizResponseSchema } from './schemas/quizResponse.schema';
import { RoomMessage, RoomMessageSchema } from './schemas/roomMessage.schema';
import { StudentCourse, StudentCourseSchema } from './schemas/studentCourse.schema';
import { Thread, ThreadSchema } from './schemas/thread.schema';
import { ThreadMessage, ThreadMessageSchema } from './schemas/threadMessage.schema';
import { ThreadMessageReply, ThreadMessageReplySchema } from './schemas/threadMessageReply.schema';
import { User, UserSchema } from './schemas/user.schema';

export const DatabaseModels = MongooseModule.forFeature([
  { name: Content.name, schema: ContentSchema },
  { name: Course.name, schema: CourseSchema },
  { name: Log.name, schema: LogSchema },
  { name: ModuleEntity.name, schema: ModuleSchema },
  { name: Notification.name, schema: NotificationSchema },
  { name: Question.name, schema: QuestionSchema },
  { name: Questionbank.name, schema: QuestionbankSchema },
  { name: QuizResponse.name, schema: QuizResponseSchema },
  { name: RoomMessage.name, schema: RoomMessageSchema },
  { name: StudentCourse.name, schema: StudentCourseSchema },
  { name: Thread.name, schema: ThreadSchema },
  { name: ThreadMessage.name, schema: ThreadMessageSchema },
  { name: ThreadMessageReply.name, schema: ThreadMessageReplySchema },
  { name: User.name, schema: UserSchema },
]);
