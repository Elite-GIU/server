import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Chat extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
  courseId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  senderId: Types.ObjectId;

  @Prop({ type: String, ref: 'User', required: true })
  senderName: string;

  @Prop({ type: String, ref: 'User', required: true })
  senderRole: string;

  @Prop({ type: String, required: true })
  message: string;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);