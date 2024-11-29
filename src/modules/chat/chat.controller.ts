import { Controller, Get, Post, UseGuards, Body, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { RoomMessageDto } from './dto/RoomMessageDto';
import { ExistParam } from 'src/common/decorators/existParam.decorator';
import { CheckExistValidatorPipe } from 'src/common/pipes/check-exist-validator.pipe';
import { GetUser } from 'src/common/decorators/getUser.decorator';
@Controller('chat')
@ApiTags('Chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiResponse({ status: 401, description: 'Unauthorized' })
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // GET /chat/study-room/courses/:courseId - Get messages of a study room
  @Get('study-room/courses/:id')
  @ApiParam({ name: 'id', required: true, description: 'Course ID' })
  @ApiOperation({ summary: 'Get messages of a study room' })
  @ApiResponse({ status: 200, description: 'Messages fetched successfully' })
  @ApiResponse({ status: 404, description: 'Course Not Found' })
  async getRoomMessages(
    @ExistParam({ idKey: 'id', modelName: 'Course' }, CheckExistValidatorPipe)
    course: {
      id: string;
      modelName: string;
    },
  ) {
    return this.chatService.getRoomMessages(course.id);
  }

  // GET /chat/study-room/:courseId/messages/:messageId - Get a message in a study room
  @Get('study-room/:courseId/messages/:messageId')
  @ApiParam({ name: 'courseId', required: true, description: 'Course ID' })
  @ApiParam({ name: 'messageId', required: true, description: 'Message ID' })
  @ApiOperation({ summary: 'Get a message in a study room' })
  @ApiResponse({ status: 200, description: 'Message fetched successfully' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  async getRoomMessage(
    @ExistParam(
      { idKey: 'courseId', modelName: 'Course' },
      CheckExistValidatorPipe,
    )
    course: {
      id: string;
      modelName: string;
    },
    @ExistParam(
      { idKey: 'messageId', modelName: 'RoomMessage' },
      CheckExistValidatorPipe,
    )
    message: {
      id: string;
      modelName: string;
    },
  ) {
    return this.chatService.getRoomMessage(course.id, message.id);
  }

  // POST chat/study-room/courses/:id - Send message to a study room
  @Post('study-room/courses/:id')
  @ApiParam({ name: 'id', required: true, description: 'Course ID' })
  @ApiOperation({ summary: 'Send message to a study room' })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  @ApiResponse({ status: 404, description: 'Course Not Found' })
  async sendMessage(
    @GetUser('userId') userId: string,
    @ExistParam({ idKey: 'id', modelName: 'Course' }, CheckExistValidatorPipe)
    course: {
      id: string;
      modelName: string;
    },
    @Body() messageData: RoomMessageDto,
  ) {
    return this.chatService.sendMessage(userId, course.id, messageData);
  }

  // POST chat/study-room/:courseId/messages/:messageId - Reply to a message in a study room
  @Post('study-room/:courseId/messages/:messageId')
  @ApiParam({ name: 'courseId', required: true, description: 'Course ID' })
  @ApiParam({ name: 'messageId', required: true, description: 'Message ID' })
  @ApiOperation({ summary: 'Reply to a message in a study room' })
  @ApiResponse({ status: 201, description: 'Reply sent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid course ID' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  async replyToMessage(
    @GetUser('userId') userId: string,
    @ExistParam(
      { idKey: 'courseId', modelName: 'Course' },
      CheckExistValidatorPipe,
    )
    course: {
      id: string;
      modelName: string;
    },
    @ExistParam(
      { idKey: 'messageId', modelName: 'RoomMessage' },
      CheckExistValidatorPipe,
    )
    message: {
      id: string;
      modelName: string;
    },
    @Body() messageData: RoomMessageDto,
  ) {
    return this.chatService.replyToMessage(
      userId,
      course.id,
      message.id,
      messageData,
    );
  }

  // GET /forums/courses/:courseId - Get messages of a thread
}
