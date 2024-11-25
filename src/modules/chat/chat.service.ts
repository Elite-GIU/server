import { Injectable } from '@nestjs/common';
import { Schema } from 'mongoose';

@Injectable()
export class ChatService {
    replyToMessage(data: { messageId: import("mongoose").ObjectId; content: string; }) {
        throw new Error('Method not implemented.');
    }
    sendMessage(RoomMessageDto: any) {
        throw new Error('Method not implemented.');
    }
    getRoomMessages(courseId: Schema.Types.ObjectId) {
        throw new Error('Method not implemented.');
    }
}
