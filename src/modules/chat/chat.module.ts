import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { DatabaseModule } from 'src/database/database.module';
import { LogsModule } from '../logs/logs.module';
import { LogsService } from '../logs/logs.service';

@Module({
  imports: [DatabaseModule,LogsModule],
  controllers: [ChatController],
  providers: [ChatService, LogsService],
})
export class ChatModule {}
