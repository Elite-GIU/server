import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { DatabaseModule } from 'src/database/database.module';
import { LogsModule } from '../logs/logs.module';
import { LogsService } from '../logs/logs.service';

@Module({
  imports: [
    DatabaseModule, 
    LogsModule
  ],
  controllers: [NotificationController],
  providers: [NotificationService, LogsService],
})
export class NotificationModule {}
