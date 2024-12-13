import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Notification extends Document {
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], required: true })
  notify_list: Types.ObjectId[];

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  message: string;

  @Prop({ type: String, enum: ['message', 'thread'] })
  type: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);