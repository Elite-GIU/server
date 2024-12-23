import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: { createdAt: 'timestamp', updatedAt: false } })
export class Log extends Document {
  @Prop({ type: Types.ObjectId, required: false, ref: 'User' })
  user_id?: Types.ObjectId; 

  @Prop({ required: true })
  event: string; 

  @Prop({ required: true })
  timestamp: Date; 

  @Prop({ required: true })
  status: number;

  @Prop({ required: true, enum: ['auth', 'general'] })
  type: string;

  @Prop({ required: true })
  ip?: string;
}

export const LogSchema = SchemaFactory.createForClass(Log);
