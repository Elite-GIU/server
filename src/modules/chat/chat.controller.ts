import { Controller, Get, Post, UseGuards, Body, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { RoomMessageDto } from './dto/RoomMessageDto';
@Controller('chat')
@ApiTags('Chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // GET /chat/study-room/courses/:courseId - Get messages of a study room
  @Get('study-room/courses/:courseId')
  @ApiOperation({ summary: 'Get messages of a study room' })
  @ApiResponse({ status: 200, description: 'Messages fetched successfully' })
  @ApiResponse({ status: 404, description: 'Course Not Found' })
  async getRoomMessages(@Param('courseId') courseId: string) {
    return this.chatService.getRoomMessages(courseId);
  }

  // GET /chat/study-room/:courseId/messages/:messageId - Get a message in a study room
  @Get('study-room/:courseId/messages/:messageId')
  @ApiOperation({ summary: 'Get a message in a study room' })
  @ApiResponse({ status: 200, description: 'Message fetched successfully' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  async getRoomMessage(
    @Param('courseId') courseId: string,
    @Param('messageId') messageId: string,
  ) {
    return this.chatService.getRoomMessage(courseId, messageId);
  }

  // POST chat/study-room/courses/:courseId - Send message to a study room
  @Post('study-room/courses/:courseId')
  @ApiOperation({ summary: 'Send message to a study room' })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  @ApiResponse({ status: 404, description: 'Course Not Found' })
  async sendMessage(
    @Param('courseId') courseId: string,
    @Body() messageData: RoomMessageDto,
  ) {
    return this.chatService.sendMessage(courseId, messageData);
  }

  // POST chat/study-room/:courseId - Reply to a message in a study room
  @Post('study-room/:courseId/messages/:messageId')
  @ApiOperation({ summary: 'Reply to a message in a study room' })
  @ApiResponse({ status: 201, description: 'Reply sent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid course ID' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  async replyToMessage(
    @Param('courseId') courseId: string,
    @Param('messageId') messageId: string,
    @Body() messageData: RoomMessageDto,
  ) {
    return this.chatService.replyToMessage(courseId, messageId, messageData);
  }

  // GET /forums/courses/:courseId - Get messages of a thread
}
