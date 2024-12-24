import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification } from '../../database/schemas/notification.schema';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<Notification>,
  ) {}
  async getNotifications(userId: string) {
    return await this.notificationModel
      .find({ notify_list: { $in: [new Types.ObjectId(userId)] } })
      .sort({ createdAt: -1 });
  }
}
