import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Notification extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_d: Types.ObjectId;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  message: string;

  @Prop({ type: String, enum: ['info', 'success', 'warning', 'error'], default: 'info' })
  type: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);