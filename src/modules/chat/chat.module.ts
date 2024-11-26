import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { MongooseModule } from '@nestjs/mongoose';
import { RoomMessage, RoomMessageSchema } from 'src/database/schemas/roomMessage.schema';
import { User, UserSchema } from 'src/database/schemas/user.schema';
import { Course, CourseSchema } from 'src/database/schemas/course.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: RoomMessage.name, schema: RoomMessageSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Course.name, schema: CourseSchema }]),
  ],
  controllers: [ChatController],
  providers: [ChatService]
})
export class ChatModule {}
