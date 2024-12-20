import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Model, ObjectId, Schema, Types } from 'mongoose';
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
import { ThreadEditDto } from './dto/ThreadEditDto';
import { NotificationService } from '../notification/notification.service';
import { Notification } from 'src/database/schemas/notification.schema';

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
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<Notification>,
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
        .sort({ createdAt: -1 });
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
      let { title, description, members_list } = roomData;
      members_list = [...members_list, userId];
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
      //Get the room name
      const { title } = await this.roomModel.findOne({
        _id: new Types.ObjectId(room_id),
      });
      // Get the sender name
      const { name } = await this.userModel.findOne({ _id: sender_id });
      // Save the notification
      const { members_list } = await this.roomModel.findOne({ _id: room_id });
      // Destructure members_list to array of user_id
      await this.sendNotification(
        members_list,
        'New Message',
        `You have a new message in ${title} from ${name} : ${content}`,
        'message',
      );
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
      const { title } = await this.roomModel.findOne({
        _id: new Types.ObjectId(room_id),
      });
      const { name } = await this.userModel.findOne({ _id: sender_id });
      const { members_list } = await this.roomModel.findOne({ _id: room_id });
      await this.sendNotification(
        members_list,
        'New Reply',
        `You have a new reply in ${title} from ${name}: ${content}`,
        'message',
      );
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
  
      const threads = await this.threadModel.aggregate([
        {
          $match: {
            course_id: new Types.ObjectId(course_id),
            ...(title && { title: { $regex: new RegExp(title, 'i') } }),
          },
        },
        {
          $lookup: {
            from: 'users', 
            localField: 'creator_id',
            foreignField: '_id',
            as: 'creatorDetails',
          },
        },
        {
          $unwind: '$creatorDetails',
        },
        {
          $lookup: {
            from: 'threadmessages',
            localField: '_id',
            foreignField: 'thread_id',
            as: 'messages',
          },
        },
        {
          $project: {
            title: 1,
            description: 1,
            creator_id: {
              _id: '$creatorDetails._id',
              name: '$creatorDetails.name', 
              role: {
                $cond: {
                  if: { $eq: ['$creatorDetails._id', new Types.ObjectId(userId)] },
                  then: 'thread master',
                  else: '$creatorDetails.role',
                },
              },
            },
            createdAt: 1,
            messagesCount: { $size: '$messages' },
          },
        },
        {
          $sort: { createdAt: -1 },
        },
      ]);
  
      if (!threads.length) {
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
   
  async getThread(userId: string, course_id: string, thread_id: string) {
    try {
      const enrolled = await this.isAssociatedWithCourse(userId, course_id);
      if (!enrolled) {
        throw new HttpException(
          'You are not associated with this course',
          HttpStatus.UNAUTHORIZED,
        );
      }
  
      const thread = await this.threadModel.aggregate([
        {
          $match: {
            _id: new Types.ObjectId(thread_id),
            course_id: new Types.ObjectId(course_id),
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'creator_id',
            foreignField: '_id',
            as: 'creatorDetails',
          },
        },
        {
          $unwind: {
            path: '$creatorDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'threadmessages',
            localField: '_id',
            foreignField: 'thread_id',
            as: 'messages',
          },
        },
        {
          $project: {
            title: 1,
            description: 1,
            creator_id: {
              _id: '$creatorDetails._id',
              name: '$creatorDetails.name',
              role: {
                $cond: {
                  if: { $eq: ['$creatorDetails._id', new Types.ObjectId(userId)] },
                  then: 'thread master',
                  else: '$creatorDetails.role',
                },
              },
            },
            createdAt: 1,
            messagesCount: { $size: '$messages' },
          },
        },
      ]);
  
      if (!thread.length) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Thread not found',
          data: null,
        };
      }
      return {
        statusCode: HttpStatus.OK,
        message: 'Thread fetched successfully',
        data: thread[0], // Return the first (and only) thread
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
        .sort({ createdAt: -1 });
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
        .sort({ createdAt: -1 });
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

  async getMembersList(course_id: string) {
    return await this.studentCourseModel
      .find({
        course_id: new Types.ObjectId(course_id),
      })
      .select('user_id');
  }

  // async postThread(
  //   creator_id: string,
  //   role: string,
  //   course_id: string,
  //   threadData: ThreadDto,
  // ) {
  //   try {
  //     const enrolled = await this.isAssociatedWithCourse(creator_id, course_id);
  //     if (!enrolled) {
  //       throw new HttpException(
  //         'You are not associated with this course',
  //         HttpStatus.UNAUTHORIZED,
  //       );
  //     }
  //     const { title, description } = threadData;
  //     const thread = new this.threadModel({
  //       course_id: new Types.ObjectId(course_id),
  //       creator_id: new Types.ObjectId(creator_id),
  //       title,
  //       description,
  //     });

  //     await this.threadModel.create(thread);
  //     const { title: courseName } = await this.courseModel.findOne({
  //       _id: new Types.ObjectId(course_id),
  //     });
  //     const { name } = await this.userModel.findOne({ _id: creator_id });
  //     const type = role === 'instructor' ? 'Announcement' : 'Thread';
  //     //Get student id list from course by id
  //     const members_list = await this.getMembersList(course_id);
  //     await this.sendNotification(
  //       members_list,
  //       `New ${type}`,
  //       `You have a new ${type} in ${courseName} from ${name}: ${title}`,
  //       'thread',
  //     );

  //     const data = {
  //       ...thread.toObject(),
  //       creator_id: {
  //         name: name,
  //       },
  //       createdAt: new Date(),
  //     };
  //     return {
  //       statusCode: HttpStatus.OK,
  //       message: 'Thread created successfully',
  //       data: data,
  //     };
  //   } catch (error) {
  //     if (error instanceof HttpException) {
  //       throw error;
  //     }
  //     throw new HttpException(
  //       `Database error: ${error.message}`,
  //       HttpStatus.INTERNAL_SERVER_ERROR,
  //     );
  //   }
  // }

  // return this structure 
  // _id: string;
  // course_id: string;
  // title: string;
  // creator_id: {
  //   _id: string;
  //   name: string;
  //   role: string;
  // };
  // createdAt: string;
  // description: string;
  // messagesCount: number;

  async postThread(
    creator_id: string,
    role: string,
    course_id: string,
    threadData: ThreadDto,
  ) {
    try {
      // Check if the user is associated with the course
      const enrolled = await this.isAssociatedWithCourse(creator_id, course_id);
      if (!enrolled) {
        throw new HttpException(
          'You are not associated with this course',
          HttpStatus.UNAUTHORIZED,
        );
      }
  
      const { title, description } = threadData;
  
      // Create a new thread
      const thread = new this.threadModel({
        course_id: new Types.ObjectId(course_id),
        creator_id: new Types.ObjectId(creator_id),
        title,
        description,
      });
  
      await this.threadModel.create(thread);
  
      // Fetch additional details
      const course = await this.courseModel.findOne({
        _id: new Types.ObjectId(course_id),
      });
      const user = await this.userModel.findOne({ _id: creator_id });
  
      const type = role === 'instructor' ? 'Announcement' : 'Thread';
  
      // Get the list of course members
      const members_list = await this.getMembersList(course_id);
  
      // Send notification to course members
      await this.sendNotification(
        members_list,
        `New ${type}`,
        `You have a new ${type} in ${course.title} from ${user.name}: ${title}`,
        'thread',
      );
  
      // Build the response structure
      const data = {
        _id: thread._id.toString(),
        course_id: course_id,
        title: title,
        creator_id: {
          _id: user._id.toString(),
          name: user.name,
          role: creator_id === user._id.toString() ? 'thread master' : role, // Check if the creator is the current user
        },
        createdAt: new Date().toISOString(),
        description: description,
        messagesCount: 0, // Newly created thread will have no messages
      };
  
      return {
        statusCode: HttpStatus.OK,
        message: 'Thread created successfully',
        data: data,
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
      const members_list = await this.getMembersList(course_id);
      const { title } = await this.threadModel.findOne({
        _id: new Types.ObjectId(thread_id),
      });
      const { name, role } = await this.userModel.findOne({ _id: userId });
      await this.sendNotification(
        members_list,
        'New Message',
        `You have a new message in ${title} thread from ${name}: ${content}`,
        'thread',
      );
      const data = {
        ...message.toObject(),
        sender_id: {
          name: name,
          role: role
        },
        createdAt: new Date(),
      };
      return {
        statusCode: HttpStatus.OK,
        message: 'Message sent successfully',
        data: data,
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
      const members_list = await this.getMembersList(course_id);
      const { title } = await this.threadModel.findOne({
        _id: new Types.ObjectId(thread_id),
      });
      const { name } = await this.userModel.findOne({ _id: userId });
      await this.sendNotification(
        members_list,
        'New Reply',
        `You have a new reply in ${title} thread from ${name}: ${content}`,
        'thread',
      );
      const data = {
        ...reply.toObject(),
        sender_id: {
          name: name,
        },
        createdAt: new Date(),
      };
      return {
        statusCode: HttpStatus.OK,
        message: 'Reply sent successfully',
        data: data,
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

  async isCreator(userId: string, _id: string) {
    const thread = await this.threadModel.findOne({
      _id: new Types.ObjectId(_id),
    });
    if (thread.creator_id.toString() !== userId) {
      return false;
    }
    return true;
  }

  async editThread(
    userId: string,
    course_id: string,
    _id: string,
    threadData: ThreadEditDto,
  ) {
    try {
      const enrolled = await this.isAssociatedWithCourse(userId, course_id);
      if (!enrolled) {
        throw new HttpException(
          'You are not associated with this course',
          HttpStatus.UNAUTHORIZED,
        );
      }
      const isCreator = await this.isCreator(userId, _id);
      if (!isCreator) {
        throw new HttpException(
          'You are not the creator of this thread',
          HttpStatus.UNAUTHORIZED,
        );
      }
      const { title, description } = threadData;
      const thread = await this.threadModel.findOne({
        _id: new Types.ObjectId(_id),
      });
      if (title) thread.title = title;
      if (description) thread.description = description;
      await thread.save();
      return {
        statusCode: HttpStatus.OK,
        message: 'Thread updated successfully',
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

  async deleteThread(
    userId: string,
    role: string,
    course_id: string,
    _id: string,
  ) {
    try {
      const enrolled = await this.isAssociatedWithCourse(userId, course_id);
      if (!enrolled) {
        throw new HttpException(
          'You are not associated with this course',
          HttpStatus.UNAUTHORIZED,
        );
      }
      const isCreator = await this.isCreator(userId, _id);
      if (!isCreator && role !== 'instructor') {
        throw new HttpException(
          'You are not the creator of this thread',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const thread = await this.threadModel.findOne({
        _id: new Types.ObjectId(_id),
      });
      await thread.deleteOne({ _id: new Types.ObjectId(_id) });
      return {
        statusCode: HttpStatus.OK,
        message: 'Thread deleted successfully',
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

  async sendNotification(
    notify_list: any,
    title: string,
    message: string,
    type: string,
  ) {
    var transformedNotifyList;
    if (type === 'thread') {
      transformedNotifyList = notify_list.map(
        (member) => new Types.ObjectId(member.user_id),
      );
    } else {
      transformedNotifyList = notify_list.map(
        (member) => new Types.ObjectId(member),
      );
    }
    await this.notificationModel.create({
      notify_list: transformedNotifyList,
      title: title,
      message: message,
      type: type,
    });
  }

  async getStudentsList(user_id: string, course_id: string) {
    const enrolled = await this.isAssociatedWithCourse(user_id, course_id);
    if (!enrolled) {
      throw new HttpException(
        'You are not associated with this course',
        HttpStatus.UNAUTHORIZED,
      );
    }
    const members = await this.studentCourseModel
      .find({
        course_id: new Types.ObjectId(course_id),
      })
      .select('user_id');

    const userIds = members.map((member) => member.user_id);

    const activeUsers = await this.userModel
      .find({
        _id: { $in: userIds },
        isActive: true,
      })
      .select('name _id');
    return activeUsers.map((user) => ({
      user_id: user._id,
      name: user.name,
    }));
  }
}
