import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Model, Schema } from 'mongoose';
import { RoomMessage } from 'src/database/schemas/roomMessage.schema';
import { RoomMessageDto } from './dto/RoomMessageDto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/database/schemas/user.schema';
import { Course } from 'src/database/schemas/course.schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(RoomMessage.name)
    private readonly roomMessageModel: Model<RoomMessage>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Course.name) private readonly courseModel: Model<Course>,
  ) {}

  async getRoomMessages(courseId: string) {
    /*
       // Check if the course exists
       const course = await this.courseModel.findById(courseId).exec();
       if (!course) {
         throw new HttpException('Course Not Found', HttpStatus.NOT_FOUND);
       }
*/
    const messages = await this.roomMessageModel
      .find({ courseId })
      .populate('senderId', 'name role')
      .sort({ createdAt: 1 })
      .exec();

    return {
      statusCode: HttpStatus.OK,
      message: 'Messages fetched successfully',
      data: messages,
    };
  }

  async getRoomMessage(courseId: string, messageId: string) {
    try {
      /*
       // Check if the course exists
       const course = await this.courseModel.findById(courseId).exec();
       if (!course) {
         throw new HttpException('Course Not Found', HttpStatus.NOT_FOUND);
       }
*/
      const message = await this.roomMessageModel
        .findOne({ courseId, _id: messageId })
        .populate('senderId', 'name role')
        .exec();

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
  async sendMessage(courseId: string, messageData: RoomMessageDto) {
    try {
      /*
      // Check if the course exists
      const course = await this.courseModel.findById(courseId).exec();
      if (!course) {
        throw new HttpException('Course Not Found', HttpStatus.NOT_FOUND);
      }*/
      const { senderId, content } = messageData;
      const message = new this.roomMessageModel({
        courseId,
        senderId,
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
    courseId: string,
    messageId: string,
    messageData: RoomMessageDto,
  ) {
    try {
      const { senderId, content } = messageData;
      /*
      // Check if the course exists
      const course = await this.courseModel.findById(courseId).exec();
      if (!course) {
        throw new HttpException('Course Not Found', HttpStatus.NOT_FOUND);
      }*/

      // Check if the message exists
      const message = await this.roomMessageModel.findById(messageId).exec();
      if (!message) {
        throw new HttpException('Message not found', HttpStatus.NOT_FOUND);
      }
      const reply = new this.roomMessageModel({
        courseId,
        senderId,
        parentId: messageId,
        content,
      });
      await this.roomMessageModel.create(reply);
      return {
        statusCode: HttpStatus.OK,
        message: 'Reply sent successfully',
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
