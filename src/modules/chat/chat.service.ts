import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Model, Schema, Types } from 'mongoose';
import { RoomMessage } from 'src/database/schemas/roomMessage.schema';
import { RoomMessageDto } from './dto/RoomMessageDto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/database/schemas/user.schema';
import { Course } from 'src/database/schemas/course.schema';
import { Console } from 'console';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(RoomMessage.name)
    private readonly roomMessageModel: Model<RoomMessage>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Course.name) private readonly courseModel: Model<Course>,
  ) {}

  async getRoomMessages(courseId: string) {
    const messages = await this.roomMessageModel
      .find({ course_id: new Types.ObjectId(courseId) })
      .populate('sender_id', 'name role')
      .sort({ createdAt: 1 });

    return {
      statusCode: HttpStatus.OK,
      message: 'Messages fetched successfully',
      data: messages,
    };
  }

  async getRoomMessage(course_id: string, message_id: string) {
    try {
      const message = await this.roomMessageModel
        .findOne({
          course_id: new Types.ObjectId(course_id),
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
  async sendMessage(
    sender_id: string,
    course_id: string,
    messageData: RoomMessageDto,
  ) {
    try {
      const { content } = messageData;
      const message = new this.roomMessageModel({
        course_id: new Types.ObjectId(course_id),
        sender_id: new Types.ObjectId(sender_id),
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
    messageId: string,
    messageData: RoomMessageDto,
  ) {
    try {
      const { content } = messageData;

      const reply = new this.roomMessageModel({
        course_id: new Types.ObjectId(course_id),
        sender_id: new Types.ObjectId(sender_id),
        parent_id: new Types.ObjectId(messageId),
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
