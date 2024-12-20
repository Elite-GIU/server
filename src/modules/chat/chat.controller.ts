import {
  Controller,
  Get,
  Post,
  UseGuards,
  Body,
  Param,
  Query,
  Patch,
  Put,
  Delete,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { MessageDto } from './dto/MessageDto';
import { ExistParam } from 'src/common/decorators/existParam.decorator';
import { CheckExistValidatorPipe } from 'src/common/pipes/check-exist-validator.pipe';
import { GetUser } from 'src/common/decorators/getUser.decorator';
import { ThreadDto } from './dto/ThreadDto';
import { RoomDto } from './dto/RoomDto';
import { AssignedParam } from 'src/common/decorators/assignedParam.decorator';
import { CheckAssignedValidatorPipe } from 'src/common/pipes/check-assigned-validator.pipe';
import { StudyRoom } from 'src/database/schemas/studyRoom.schema';
import { ThreadEditDto } from './dto/ThreadEditDto';
@Controller('chat')
@ApiTags('Chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiResponse({ status: 401, description: 'Unauthorized' })
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  //---------------------------------- STUDY ROOMS ----------------------------------\\

  // Get study rooms of a course
  @Get('study-room/courses/:courseId')
  @ApiParam({ name: 'courseId', required: true, description: 'Course ID' })
  @ApiOperation({ summary: 'Get study rooms of a course' })
  @ApiResponse({ status: 200, description: 'Study rooms fetched successfully' })
  @ApiResponse({ status: 404, description: 'Course Not Found' })
  async getCourseRooms(
    @GetUser('userId') userId: string,
    @ExistParam(
      { idKey: 'courseId', modelName: 'Course' },
      CheckExistValidatorPipe,
    )
    course: {
      id: string;
      modelName: string;
    },
  ) {
    return this.chatService.getCourseRooms(userId, course.id);
  }

  // Get messages of a study room
  @Get('study-room/courses/:courseId/rooms/:roomId')
  @ApiParam({ name: 'courseId', required: true, description: 'Course ID' })
  @ApiParam({ name: 'roomId', required: true, description: 'Room ID' })
  @ApiOperation({ summary: 'Get messages of a study room' })
  @ApiResponse({ status: 200, description: 'Messages fetched successfully' })
  @ApiResponse({ status: 404, description: 'Course Not Found' })
  async getRoomMessages(
    @GetUser('userId') userId: string,
    @AssignedParam(
      {
        modelName: 'StudyRoom',
        firstAttrName: 'course_id',
        secondAttrName: '_id',
        firstKey: 'courseId',
        secondKey: 'roomId',
      },
      CheckAssignedValidatorPipe,
    )
    studyRoom: {
      course_id: string;
      _id: string;
    },
  ) {
    return this.chatService.getRoomMessages(
      userId,
      studyRoom.course_id,
      studyRoom._id,
    );
  }

  // Get a message in a study room
  @Get('study-room/courses/:courseId/rooms/:roomId/messages/:messageId')
  @ApiParam({ name: 'courseId', required: true, description: 'Course ID' })
  @ApiParam({ name: 'roomId', required: true, description: 'Room ID' })
  @ApiParam({ name: 'messageId', required: true, description: 'Message ID' })
  @ApiOperation({ summary: 'Get a message in a study room' })
  @ApiResponse({ status: 200, description: 'Message fetched successfully' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  async getRoomMessage(
    @GetUser('userId') userId: string,
    @AssignedParam(
      {
        modelName: 'StudyRoom',
        firstAttrName: 'course_id',
        secondAttrName: '_id',
        firstKey: 'courseId',
        secondKey: 'roomId',
      },
      CheckAssignedValidatorPipe,
    )
    studyRoom: { course_id: string; _id: string },
    @AssignedParam(
      {
        modelName: 'RoomMessage',
        firstAttrName: 'room_id',
        secondAttrName: '_id',
        firstKey: 'roomId',
        secondKey: 'messageId',
      },
      CheckAssignedValidatorPipe,
    )
    message: { _id: string },
  ) {
    return this.chatService.getRoomMessage(
      userId,
      studyRoom.course_id,
      studyRoom._id,
      message._id,
    );
  }

  // Create a study room
  @Post('study-room/courses/:courseId')
  @ApiParam({ name: 'courseId', required: true, description: 'Course ID' })
  @ApiOperation({ summary: 'Create a study room' })
  @ApiResponse({ status: 201, description: 'Room created successfully' })
  @ApiResponse({ status: 404, description: 'Course Not Found' })
  async createRoom(
    @GetUser('userId') userId: string,
    @ExistParam(
      { idKey: 'courseId', modelName: 'Course' },
      CheckExistValidatorPipe,
    )
    course: {
      id: string;
      modelName: string;
    },
    @Body() roomData: RoomDto,
  ) {
    return this.chatService.createRoom(userId, course.id, roomData);
  }

  // Send message to a study room
  @Post('study-room/courses/:courseId/rooms/:roomId')
  @ApiParam({ name: 'courseId', required: true, description: 'Course ID' })
  @ApiParam({ name: 'roomId', required: true, description: 'Room ID' })
  @ApiOperation({ summary: 'Send message to a study room' })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  @ApiResponse({ status: 404, description: 'Course Not Found' })
  async sendMessage(
    @GetUser('userId') userId: string,
    @AssignedParam(
      {
        modelName: 'StudyRoom',
        firstAttrName: 'course_id',
        secondAttrName: '_id',
        firstKey: 'courseId',
        secondKey: 'roomId',
      },
      CheckAssignedValidatorPipe,
    )
    studyRoom: { course_id: string; _id: string },
    @Body() messageData: MessageDto,
  ) {
    return this.chatService.sendMessage(
      userId,
      studyRoom.course_id,
      studyRoom._id,
      messageData,
    );
  }

  // Reply to a message in a study room
  @Post('study-room/courses/:courseId/rooms/:roomId/messages/:messageId')
  @ApiParam({ name: 'courseId', required: true, description: 'Course ID' })
  @ApiParam({ name: 'roomId', required: true, description: 'Room ID' })
  @ApiParam({ name: 'messageId', required: true, description: 'Message ID' })
  @ApiOperation({ summary: 'Reply to a message in a study room' })
  @ApiResponse({ status: 201, description: 'Reply sent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid course ID' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  async replyToMessage(
    @GetUser('userId') userId: string,
    @AssignedParam(
      {
        modelName: 'StudyRoom',
        firstAttrName: 'course_id',
        secondAttrName: '_id',
        firstKey: 'courseId',
        secondKey: 'roomId',
      },
      CheckAssignedValidatorPipe,
    )
    studyRoom: { course_id: string; _id: string },
    @AssignedParam(
      {
        modelName: 'RoomMessage',
        firstAttrName: 'room_id',
        secondAttrName: '_id',
        firstKey: 'roomId',
        secondKey: 'messageId',
      },
      CheckAssignedValidatorPipe,
    )
    message: { _id: string },
    @Body() messageData: MessageDto,
  ) {
    return this.chatService.replyToMessage(
      userId,
      studyRoom.course_id,
      studyRoom._id,
      message._id,
      messageData,
    );
  }

  //---------------------------------- FORUMS ----------------------------------\\

  // Get threads of a course
  @Get('forums/courses/:id/')
  @ApiParam({ name: 'id', required: true, description: 'Course ID' })
  @ApiOperation({ summary: 'Get threads of a course' })
  @ApiResponse({ status: 200, description: 'Threads fetched successfully' })
  @ApiResponse({ status: 400, description: 'Invalid course ID' })
  @ApiQuery({
    name: 'title',
    required: false,
    description: 'Search for a thread by title',
  })
  async getCourseThreads(
    @GetUser('userId') userId: string,
    @ExistParam({ idKey: 'id', modelName: 'Course' }, CheckExistValidatorPipe)
    course: {
      id: string;
      modelName: string;
    },
    @Query('title') title: string,
  ) {
    return this.chatService.getCourseThreads(userId, course.id, title);
  }

  // Get specific thread
  @Get('forums/courses/:courseId/threads/:threadId')
  @ApiParam({ name: 'courseId', required: true, description: 'Course ID' })
  @ApiParam({ name: 'threadId', required: true, description: 'Thread ID' })
  @ApiOperation({ summary: 'Get specific thread' })
  @ApiResponse({ status: 200, description: 'Thread fetched successfully' })
  @ApiResponse({ status: 400, description: 'Invalid ID' })
  async getThread(
    @GetUser('userId') userId: string,
    @AssignedParam(
      {
        modelName: 'Thread',
        firstAttrName: 'course_id',
        secondAttrName: '_id',
        firstKey: 'courseId',
        secondKey: 'threadId',
      },
      CheckAssignedValidatorPipe,
    )
    thread: {
      _id: string;
      course_id: string;
    },
  ) {
    return this.chatService.getThread(userId, thread.course_id, thread._id);
  }
  // Get specific thread messages
  @Get('forums/courses/:courseId/threads/:threadId/messages')
  @ApiParam({ name: 'courseId', required: true, description: 'Course ID' })
  @ApiParam({ name: 'threadId', required: true, description: 'Thread ID' })
  @ApiOperation({ summary: 'Get specific thread messages' })
  @ApiResponse({
    status: 200,
    description: 'Thread messages fetched successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid ID' })
  async getThreadMessages(
    @GetUser('userId') userId: string,
    @AssignedParam(
      {
        modelName: 'Thread',
        firstAttrName: 'course_id',
        secondAttrName: '_id',
        firstKey: 'courseId',
        secondKey: 'threadId',
      },
      CheckAssignedValidatorPipe,
    )
    thread: {
      _id: string;
      course_id: string;
    },
  ) {
    return this.chatService.getThreadMessages(
      userId,
      thread.course_id,
      thread._id,
    );
  }

  // Get message replies
  @Get('forums/courses/:courseId/threads/:threadId/messages/:messageId')
  @ApiParam({ name: 'courseId', required: true, description: 'Course ID' })
  @ApiParam({ name: 'threadId', required: true, description: 'Thread ID' })
  @ApiParam({ name: 'messageId', required: true, description: 'Message ID' })
  @ApiOperation({ summary: 'Get thread message replies' })
  @ApiResponse({
    status: 200,
    description: 'Message replies fetched successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid ID' })
  async getThreadMessageReplies(
    @GetUser('userId') userId: string,
    @AssignedParam(
      {
        modelName: 'Thread',
        firstAttrName: 'course_id',
        secondAttrName: '_id',
        firstKey: 'courseId',
        secondKey: 'threadId',
      },
      CheckAssignedValidatorPipe,
    )
    thread: {
      _id: string;
      course_id: string;
    },
    @AssignedParam(
      {
        modelName: 'ThreadMessage',
        firstAttrName: 'thread_id',
        secondAttrName: '_id',
        firstKey: 'threadId',
        secondKey: 'messageId',
      },
      CheckAssignedValidatorPipe,
    )
    message: { _id: string },
  ) {
    return this.chatService.getThreadMessageReplies(
      userId,
      thread.course_id,
      thread._id,
      message._id,
    );
  }

  // Post new thread
  @Post('forums/courses/:id')
  @ApiParam({ name: 'id', required: true, description: 'Course ID' })
  @ApiOperation({ summary: 'Post a new thread' })
  @ApiResponse({ status: 201, description: 'Thread created successfully' })
  @ApiResponse({ status: 404, description: 'Thread not found' })
  @ApiResponse({ status: 400, description: 'Invalid ID' })
  async postThread(
    @GetUser('userId') userId: string,
    @GetUser('role') role: string,
    @ExistParam({ idKey: 'id', modelName: 'Course' }, CheckExistValidatorPipe)
    course: {
      id: string;
      modelName: string;
    },
    @Body() threadData: ThreadDto,
  ) {
    return this.chatService.postThread(userId, role, course.id, threadData);
  }

  // Send a message in a thread
  @Post('forums/courses/:courseId/threads/:threadId/messages')
  @ApiParam({ name: 'courseId', required: true, description: 'Course ID' })
  @ApiParam({ name: 'threadId', required: true, description: 'Thread ID' })
  @ApiOperation({ summary: 'Send a message in a thread' })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  @ApiResponse({ status: 400, description: 'Invalid ID' })
  async sendMessageToThread(
    @GetUser('userId') userId: string,
    @AssignedParam(
      {
        modelName: 'Thread',
        firstAttrName: 'course_id',
        secondAttrName: '_id',
        firstKey: 'courseId',
        secondKey: 'threadId',
      },
      CheckAssignedValidatorPipe,
    )
    thread: {
      _id: string;
      course_id: string;
    },
    @Body() threadMessageData: MessageDto,
  ) {
    return this.chatService.sendMessageToThread(
      userId,
      thread.course_id,
      thread._id,
      threadMessageData,
    );
  }

  // Reply to a Thread message
  @Post('forums/courses/:courseId/threads/:threadId/messages/:messageId')
  @ApiParam({ name: 'courseId', required: true, description: 'Course ID' })
  @ApiParam({ name: 'threadId', required: true, description: 'Thread ID' })
  @ApiParam({ name: 'messageId', required: true, description: 'Message ID' })
  @ApiOperation({ summary: 'Reply to a thread message' })
  @ApiResponse({ status: 201, description: 'Reply sent successfully' })
  @ApiResponse({ status: 404, description: 'Reply not found' })
  @ApiResponse({ status: 400, description: 'Invalid ID' })
  async replyToThreadMessage(
    @GetUser('userId') userId: string,
    @AssignedParam(
      {
        modelName: 'Thread',
        firstAttrName: 'course_id',
        secondAttrName: '_id',
        firstKey: 'courseId',
        secondKey: 'threadId',
      },
      CheckAssignedValidatorPipe,
    )
    thread: {
      _id: string;
      course_id: string;
    },
    @AssignedParam(
      {
        modelName: 'ThreadMessage',
        firstAttrName: 'thread_id',
        secondAttrName: '_id',
        firstKey: 'threadId',
        secondKey: 'messageId',
      },
      CheckAssignedValidatorPipe,
    )
    message: { _id: string },
    @Body() threadMessageReplyData: MessageDto,
  ) {
    return this.chatService.replyToThreadMessage(
      userId,
      thread.course_id,
      thread._id,
      message._id,
      threadMessageReplyData,
    );
  }

  // Edit a thread
  @Put('forums/courses/:courseId/threads/:threadId')
  @ApiParam({ name: 'courseId', required: true, description: 'Course ID' })
  @ApiParam({ name: 'threadId', required: true, description: 'Thread ID' })
  @ApiOperation({ summary: 'Edit a thread' })
  @ApiResponse({ status: 200, description: 'Thread edited successfully' })
  @ApiResponse({ status: 404, description: 'Thread not found' })
  @ApiResponse({ status: 400, description: 'Invalid ID' })
  async editThread(
    @GetUser('userId') userId: string,

    @AssignedParam(
      {
        modelName: 'Thread',
        firstAttrName: 'course_id',
        secondAttrName: '_id',
        firstKey: 'courseId',
        secondKey: 'threadId',
      },
      CheckAssignedValidatorPipe,
    )
    thread: {
      _id: string;
      course_id: string;
    },
    @Body() threadData: ThreadEditDto,
  ) {
    return this.chatService.editThread(
      userId,
      thread.course_id,
      thread._id,
      threadData,
    );
  }

  // Delete a thread by student or course instructor
  @Delete('forums/courses/:courseId/threads/:threadId/')
  @ApiParam({ name: 'courseId', required: true, description: 'Course ID' })
  @ApiParam({ name: 'threadId', required: true, description: 'Thread ID' })
  @ApiOperation({ summary: 'Delete a thread' })
  @ApiResponse({ status: 200, description: 'Thread deleted successfully' })
  @ApiResponse({ status: 404, description: 'Thread not found' })
  @ApiResponse({ status: 400, description: 'Invalid ID' })
  async deleteThread(
    @GetUser('userId') userId: string,
    @GetUser('role') role: string,
    @AssignedParam(
      {
        modelName: 'Thread',
        firstAttrName: 'course_id',
        secondAttrName: '_id',
        firstKey: 'courseId',
        secondKey: 'threadId',
      },
      CheckAssignedValidatorPipe,
    )
    thread: {
      _id: string;
      course_id: string;
    },
  ) {
    return this.chatService.deleteThread(
      userId,
      role,
      thread.course_id,
      thread._id,
    );
  }

  // Get possible members to add to a study room
  @Get('study-room/courses/:id/members')
  @ApiParam({ name: 'id', required: true, description: 'Course ID' })
  @ApiOperation({ summary: 'Get members of a course' })
  @ApiResponse({ status: 200, description: 'Members fetched successfully' })
  @ApiResponse({ status: 400, description: 'Invalid course ID' })
  async getStudentsList(
    @GetUser('userId') userId: string,
    @ExistParam({ idKey: 'id', modelName: 'Course' }, CheckExistValidatorPipe)
    course: {
      id: string;
      modelName: string;
    },
  ) {
    return this.chatService.getStudentsList(userId, course.id);
  }
}
