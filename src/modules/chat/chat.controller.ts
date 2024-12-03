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
import { ThreadDto } from './dto/ThreadDto';
import { ThreadMessageDto } from './dto/ThreadMessageDto';
import { ThreadMessageReplyDto } from './dto/ThreadMessageReplyDto';
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

  //---------------------------------- FORUMS ----------------------------------\\

  // GET /forums/courses/:courseId - Get threads of a course
  @Get('forums/courses/:id')
  @ApiParam({ name: 'id', required: true, description: 'Course ID' })
  @ApiOperation({ summary: 'Get threads of a course' })
  @ApiResponse({ status: 200, description: 'Threads fetched successfully' })
  @ApiResponse({ status: 404, description: 'Thread Not Found' })
  async getThreadMessages(
    @ExistParam({ idKey: 'id', modelName: 'Course' }, CheckExistValidatorPipe)
    course: {
      id: string;
      modelName: string;
    },
  ) {
    return this.chatService.getCourseThreads(course.id);
  }
  // GET chat/forums/course:id/threads/thread:id - Get specific thread messages
  @Get('forums/courses/:courseId/threads/:threadId')
  @ApiParam({ name: 'courseId', required: true, description: 'Course ID' })
  @ApiParam({ name: 'threadId', required: true, description: 'Thread ID' })
  @ApiOperation({ summary: 'Get specific thread messages' })
  @ApiResponse({
    status: 200,
    description: 'Thread messages fetched successfully',
  })
  @ApiResponse({ status: 404, description: 'Thread not found' })
  async getThreadReplies(
    @ExistParam(
      { idKey: 'courseId', modelName: 'Course' },
      CheckExistValidatorPipe,
    )
    course: {
      id: string;
      modelName: string;
    },
    @ExistParam(
      { idKey: 'threadId', modelName: 'Thread' },
      CheckExistValidatorPipe,
    )
    thread: {
      id: string;
      modelName: string;
    },
  ) {
    return this.chatService.getThreadMessages(course.id, thread.id);
  }

  // GET chat/forums/course:id/threads/thread:id/messages/message:id - Get message replies
  @Get('forums/courses/:courseId/threads/:threadId/messages/:messageId')
  @ApiParam({ name: 'courseId', required: true, description: 'Course ID' })
  @ApiParam({ name: 'threadId', required: true, description: 'Thread ID' })
  @ApiParam({ name: 'messageId', required: true, description: 'Message ID' })
  @ApiOperation({ summary: 'Get thread message replies' })
  @ApiResponse({
    status: 200,
    description: 'Message replies fetched successfully',
  })
  @ApiResponse({ status: 404, description: 'Reply not found' })
  async getMessageReplies(
    @ExistParam(
      { idKey: 'courseId', modelName: 'Course' },
      CheckExistValidatorPipe,
    )
    course: {
      id: string;
      modelName: string;
    },
    @ExistParam(
      { idKey: 'threadId', modelName: 'Thread' },
      CheckExistValidatorPipe,
    )
    thread: {
      id: string;
      modelName: string;
    },
    @ExistParam(
      { idKey: 'messageId', modelName: 'Message' },
      CheckExistValidatorPipe,
    )
    message: {
      id: string;
      modelName: string;
    },
  ) {
    return this.chatService.getThreadMessageReplies(
      course.id,
      thread.id,
      message.id,
    );
  }

  //POST chat/forums/courses/course:id - Post new thread
  @Post('forums/courses/:id')
  @ApiParam({ name: 'id', required: true, description: 'Course ID' })
  @ApiOperation({ summary: 'Post a new thread' })
  @ApiResponse({ status: 201, description: 'Thread created successfully' })
  @ApiResponse({ status: 404, description: 'Thread not found' })
  async postThread(
    @GetUser('userId') userId: string,
    @ExistParam({ idKey: 'id', modelName: 'Course' }, CheckExistValidatorPipe)
    course: {
      id: string;
      modelName: string;
    },
    @Body() threadData: ThreadDto,
  ) {
    return this.chatService.postThread(userId, course.id, threadData);
  }

  //POST chat/forums/courses/course:id/threads/thread:id - Send a message in a thread
  @Post('forums/courses/:courseId/threads/:threadId')
  @ApiParam({ name: 'courseId', required: true, description: 'Course ID' })
  @ApiParam({ name: 'threadId', required: true, description: 'Thread ID' })
  @ApiOperation({ summary: 'Send a message in a thread' })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  async sendMessageToThread(
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
      { idKey: 'threadId', modelName: 'Thread' },
      CheckExistValidatorPipe,
    )
    thread: {
      id: string;
      modelName: string;
    },
    @Body() threadMessageData: ThreadMessageDto,
  ) {
    return this.chatService.sendMessageToThread(
      userId,
      course.id,
      thread.id,
      threadMessageData,
    );
  }

  //POST chat/forums/courses/course:id/threads/thread:id/messages/message:id - Reply to a Thread message
  @Post('forums/courses/:courseId/threads/:threadId/messages/:messageId')
  @ApiParam({ name: 'courseId', required: true, description: 'Course ID' })
  @ApiParam({ name: 'threadId', required: true, description: 'Thread ID' })
  @ApiParam({ name: 'messageId', required: true, description: 'Message ID' })
  @ApiOperation({ summary: 'Reply to a thread message' })
  @ApiResponse({ status: 201, description: 'Reply sent successfully' })
  @ApiResponse({ status: 404, description: 'Reply not found' })
  async replyToThreadMessage(
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
      { idKey: 'threadId', modelName: 'Thread' },
      CheckExistValidatorPipe,
    )
    thread: {
      id: string;
      modelName: string;
    },
    @ExistParam(
      { idKey: 'messageId', modelName: 'Message' },
      CheckExistValidatorPipe,
    )
    message: {
      id: string;
      modelName: string;
    },
    @Body() threadMessageReplyData: ThreadMessageReplyDto,
  ) {
    return this.chatService.replyToThreadMessage(
      userId,
      course.id,
      thread.id,
      message.id,
      threadMessageReplyData,
    );
  }
}
