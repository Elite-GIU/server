import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class ThreadMessageReply extends Document {
  @Prop({ type: Types.ObjectId, ref: 'ThreadMessage', required: true })
  message_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  sender_id: Types.ObjectId;
  
  @Prop({ type: String, required: true })
  content: string;
}

export const ThreadMessageReplySchema = SchemaFactory.createForClass(ThreadMessageReply);
