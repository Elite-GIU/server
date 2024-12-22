import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class RoomMessage extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
  course_id: Types.ObjectId;

  @Prop({type: Types.ObjectId, ref: 'StudyRoom', required: true})
  room_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  sender_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'RoomMessage', required: false }) // If the message is a reply, this field will be populated
  parent_id: Types.ObjectId;

  @Prop({ type: String, required: true })
  content: string;
    
  createdAt: Date;
  updatedAt: Date;
}

export const RoomMessageSchema = SchemaFactory.createForClass(RoomMessage);