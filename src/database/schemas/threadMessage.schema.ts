import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class ThreadMessage extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Thread', required: true })
  thread_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  sender_id: Types.ObjectId;

  @Prop({ type: String, required: true })
  content: string;
}

export const ThreadMessageSchema = SchemaFactory.createForClass(ThreadMessage);