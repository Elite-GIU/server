import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { GetUser } from '../../common/decorators/getUser.decorator';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
@Controller('notification')
@ApiTags('Notification')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiResponse({ status: 401, description: 'Unauthorized' })
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // Get all notifications of a user
  @Get('getNotifications')
  @ApiOperation({ summary: 'Get all notifications of a user' })
  @ApiResponse({ status: 200, description: 'Return all notifications of a user' })
  async getNotifications(@GetUser('userId') userId: string) {
    return await this.notificationService.getNotifications(userId);
  }
}
