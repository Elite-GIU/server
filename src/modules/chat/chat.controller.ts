import { Controller, Get, Post, UseGuards, Body, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { ObjectId } from 'mongoose';
import { RoomMessageDto } from './RoomMessageDto';
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}
  // Get /chat/study-room

  // GET /chat/study-room - Get messages of a study room
  @Get('study-room/courses/:courseId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get messages of a study room' })
  @ApiResponse({ status: 200, description: 'Messages fetched successfully' })
  @ApiResponse({ status: 400, description: 'Invalid course ID' })
  async getRoomMessages(@Body() courseId: ObjectId) {
    return this.chatService.getRoomMessages(courseId);
  }

  // POST chat/study-room - Send message to a study room
  @Post('study-room/courses/:courseId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send message to a study room' })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid course ID' })
  async sendMessage(
    @Param('courseId') courseId: string,
    @Body() data: RoomMessageDto,
  ) {
    return this.chatService.sendMessage(RoomMessageDto);
  }

  // POST chat/study-room/:courseId - Reply to a message in a study room
  @Post('study-room/:courseId:/messages/messageId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reply to a message in a study room' })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid course ID' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  async replyToMessage(
    @Param('courseId') courseId: string,
    @Param('messageId') messageId: string,
    @Body() data: RoomMessageDto,
  ) {
    return this.chatService.replyToMessage(null);
  }

  // GET /chat/thread - Get messages of a thread
}
