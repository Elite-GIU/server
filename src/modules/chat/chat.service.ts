import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Model, Schema, Types } from 'mongoose';
import { RoomMessage } from 'src/database/schemas/roomMessage.schema';
import { MessageDto } from './dto/MessageDto';
import { ThreadDto } from './dto/ThreadDto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/database/schemas/user.schema';
import { Course } from 'src/database/schemas/course.schema';
import { ThreadMessage } from 'src/database/schemas/threadMessage.schema';
import { ThreadMessageReply } from 'src/database/schemas/threadMessageReply.schema';
import { Thread } from 'src/database/schemas/thread.schema';
import { StudyRoom } from 'src/database/schemas/studyRoom.schema';
import { RoomDto } from './dto/RoomDto';
import { StudentCourse } from 'src/database/schemas/studentCourse.schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(RoomMessage.name)
    private readonly roomMessageModel: Model<RoomMessage>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Course.name) private readonly courseModel: Model<Course>,
    @InjectModel(StudentCourse.name)
    private readonly studentCourseModel: Model<StudentCourse>,
    @InjectModel(Thread.name) private readonly threadModel: Model<Thread>,
    @InjectModel(ThreadMessage.name)
    private readonly threadMessageModel: Model<ThreadMessage>,
    @InjectModel(ThreadMessageReply.name)
    private readonly threadMessageReplyModel: Model<ThreadMessageReply>,
    @InjectModel(StudyRoom.name) private readonly roomModel: Model<StudyRoom>,
  ) {}

  async isAssociatedWithCourse(
    userId: string,
    courseId: string,
  ): Promise<boolean> {
    // Check if the user is associated as a student
    const isStudentAssociated = await this.studentCourseModel.exists({
      $and: [
        { user_id: new Types.ObjectId(userId) },
        { course_id: new Types.ObjectId(courseId) },
      ],
    });

    // Check if the user is associated as an instructor
    const isInstructorAssociated = await this.courseModel.exists({
      $and: [
        { _id: new Types.ObjectId(courseId) },
        { instructor_id: new Types.ObjectId(userId) },
      ],
    });
    if (isStudentAssociated || isInstructorAssociated) {
      return true;
    }

    return false;
  }

  async getCourseRooms(userId: string, course_id: string) {
    try {
      const enrolled = await this.isAssociatedWithCourse(userId, course_id);
      if (!enrolled) {
        throw new HttpException(
          'You are not associated with this course',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const rooms = await this.roomModel
        .find({
          course_id: new Types.ObjectId(course_id),
        })
        .sort({ createdAt: 1 });
      return {
        statusCode: HttpStatus.OK,
        message: 'Rooms fetched successfully',
        data: rooms,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Database error: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getRoomMessages(userId: string, course_id: string, room_id: string) {
    const enrolled = await this.isAssociatedWithCourse(userId, course_id);
    if (!enrolled) {
      throw new HttpException(
        'You are not associated with this course',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const messages = await this.roomMessageModel
      .find({ room_id: new Types.ObjectId(room_id) })
      .populate('sender_id', 'name role')
      .sort({ createdAt: 1 });

    return {
      statusCode: HttpStatus.OK,
      message: 'Messages fetched successfully',
      data: messages,
    };
  }

  async getRoomMessage(
    userId: string,
    course_id: string,
    room_id: string,
    message_id: string,
  ) {
    try {
      const enrolled = await this.isAssociatedWithCourse(userId, course_id);
      if (!enrolled) {
        throw new HttpException(
          'You are not associated with this course',
          HttpStatus.UNAUTHORIZED,
        );
      }
      const message = await this.roomMessageModel
        .findOne({
          //course_id: new Types.ObjectId(course_id),
          _id: new Types.ObjectId(message_id),
        })
        .populate('sender_id', 'name role');

      return {
        statusCode: HttpStatus.OK,
        message: 'Message fetched successfully',
        data: message,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Database error: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async checkMembers(members_list: string[], course_id: string) {
    for (let i = 0; i < members_list.length; i++) {
      if (!Types.ObjectId.isValid(members_list[i])) {
        return false;
      }
      const member = await this.studentCourseModel.findOne({
        user_id: new Types.ObjectId(members_list[i]),
        course_id: new Types.ObjectId(course_id),
      });
      if (!member) {
        return false;
      }
    }
    return true;
  }

  async createRoom(userId: string, course_id: string, roomData: RoomDto) {
    try {
      const enrolled = await this.isAssociatedWithCourse(userId, course_id);
      if (!enrolled) {
        throw new HttpException(
          'You are not associated with this course',
          HttpStatus.UNAUTHORIZED,
        );
      }
      const { title, description, members_list } = roomData;
      const validMembers = await this.checkMembers(members_list, course_id);
      if (!validMembers) {
        throw new HttpException(
          'One or more members are not associated with this course',
          HttpStatus.BAD_REQUEST,
        );
      }
      const room = new this.roomModel({
        course_id: new Types.ObjectId(course_id),
        creator_id: new Types.ObjectId(userId),
        members_list: members_list.map((member) => new Types.ObjectId(member)),
        title,
        description,
      });

      await this.roomModel.create(room);
      return {
        statusCode: HttpStatus.OK,
        message: 'Room created successfully',
        data: room,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Database error: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async sendMessage(
    sender_id: string,
    course_id: string,
    room_id: string,
    messageData: MessageDto,
  ) {
    try {
      const enrolled = await this.isAssociatedWithCourse(sender_id, course_id);
      if (!enrolled) {
        throw new HttpException(
          'You are not associated with this course',
          HttpStatus.UNAUTHORIZED,
        );
      }
      const { content } = messageData;
      const message = new this.roomMessageModel({
        course_id: new Types.ObjectId(course_id),
        room_id: new Types.ObjectId(room_id),
        sender_id: new Types.ObjectId(sender_id),
        parent_id: null,
        content,
      });

      await this.roomMessageModel.create(message);
      return {
        statusCode: HttpStatus.OK,
        message: 'Message sent successfully',
        data: message,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Database error: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async replyToMessage(
    sender_id: string,
    course_id: string,
    room_id: string,
    messageId: string,
    messageData: MessageDto,
  ) {
    try {
      const enrolled = await this.isAssociatedWithCourse(sender_id, course_id);
      if (!enrolled) {
        throw new HttpException(
          'You are not associated with this course',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const { content } = messageData;

      const reply = new this.roomMessageModel({
        course_id: new Types.ObjectId(course_id),
        sender_id: new Types.ObjectId(sender_id),
        room_id: new Types.ObjectId(room_id),
        parent_id: new Types.ObjectId(messageId),
        content,
      });
      await this.roomMessageModel.create(reply);
      return {
        statusCode: HttpStatus.OK,
        message: 'Reply sent successfully',
        data: reply,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Database error: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //---------------------------------- FORUMS ----------------------------------\\

  async getCourseThreads(userId: string, course_id: string, title?: string) {
    try {
      const enrolled = await this.isAssociatedWithCourse(userId, course_id);
      if (!enrolled) {
        throw new HttpException(
          'You are not associated with this course',
          HttpStatus.UNAUTHORIZED,
        );
      }
      const threads = await this.threadModel
        .find({
          course_id: new Types.ObjectId(course_id),
          ...(title && { title: { $regex: new RegExp(title, 'i') } }),
        })
        .populate({
          path: 'creator_id',
          select: 'name role',
        })
        .sort({ createdAt: 1 });

      if (!threads) {
        return {
          statusCode: HttpStatus.OK,
          message: 'No threads found',
          data: [],
        };
      }
      return {
        statusCode: HttpStatus.OK,
        message: 'Threads fetched successfully',
        data: threads,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Database error: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async getThreadMessages(
    userId: string,
    course_id: string,
    thread_id: string,
  ) {
    try {
      const enrolled = await this.isAssociatedWithCourse(userId, course_id);
      if (!enrolled) {
        throw new HttpException(
          'You are not associated with this course',
          HttpStatus.UNAUTHORIZED,
        );
      }
      const messages = await this.threadMessageModel
        .find({
          thread_id: new Types.ObjectId(thread_id),
        })
        .populate('sender_id', 'name role')
        .sort({ createdAt: 1 });
      return {
        statusCode: HttpStatus.OK,
        message: 'Messages fetched successfully',
        data: messages,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Database error: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async getThreadMessageReplies(
    userId: string,
    course_id: string,
    thread_id: string,
    message_id: string,
  ) {
    try {
      const enrolled = await this.isAssociatedWithCourse(userId, course_id);
      if (!enrolled) {
        throw new HttpException(
          'You are not associated with this course',
          HttpStatus.UNAUTHORIZED,
        );
      }
      const replies = await this.threadMessageReplyModel
        .find({
          message_id: new Types.ObjectId(message_id),
        })
        .populate('sender_id', 'name role')
        .sort({ createdAt: 1 });
      return {
        statusCode: HttpStatus.OK,
        message: 'Replies fetched successfully',
        data: replies,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Database error: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async postThread(
    creator_id: string,
    course_id: string,
    threadData: ThreadDto,
  ) {
    try {
      const enrolled = await this.isAssociatedWithCourse(creator_id, course_id);
      if (!enrolled) {
        throw new HttpException(
          'You are not associated with this course',
          HttpStatus.UNAUTHORIZED,
        );
      }
      const { title, description } = threadData;
      const thread = new this.threadModel({
        course_id: new Types.ObjectId(course_id),
        creator_id: new Types.ObjectId(creator_id),
        title,
        description,
      });

      await this.threadModel.create(thread);
      return {
        statusCode: HttpStatus.OK,
        message: 'Thread created successfully',
        data: thread,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Database error: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async sendMessageToThread(
    userId: string,
    course_id: string,
    thread_id: string,
    messageData: MessageDto,
  ) {
    try {
      const enrolled = await this.isAssociatedWithCourse(userId, course_id);
      if (!enrolled) {
        throw new HttpException(
          'You are not associated with this course',
          HttpStatus.UNAUTHORIZED,
        );
      }
      const { content } = messageData;
      const message = new this.threadMessageModel({
        course_id: new Types.ObjectId(course_id),
        thread_id: new Types.ObjectId(thread_id),
        sender_id: new Types.ObjectId(userId),
        content,
      });
      await this.threadMessageModel.create(message);
      return {
        statusCode: HttpStatus.OK,
        message: 'Message sent successfully',
        data: message,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Database error: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async replyToThreadMessage(
    userId: string,
    course_id: string,
    thread_id: string,
    message_id: string,
    messageData: MessageDto,
  ) {
    try {
      const enrolled = await this.isAssociatedWithCourse(userId, course_id);
      if (!enrolled) {
        throw new HttpException(
          'You are not associated with this course',
          HttpStatus.UNAUTHORIZED,
        );
      }
      const { content } = messageData;
      const reply = new this.threadMessageReplyModel({
        course_id: new Types.ObjectId(course_id),
        thread_id: new Types.ObjectId(thread_id),
        message_id: new Types.ObjectId(message_id),
        sender_id: new Types.ObjectId(userId),
        content,
      });
      await this.threadMessageReplyModel.create(reply);
      return {
        statusCode: HttpStatus.OK,
        message: 'Reply sent successfully',
        data: reply,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Database error: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
