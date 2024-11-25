import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class RoomMessage extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Room', required: true })
  roomId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  senderId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'RoomMessage', required: false }) // If the message is a reply, this field will be populated
  parentId: Types.ObjectId;

  @Prop({ type: String, required: true })
  content: string;
}

export const RoomMessageSchema = SchemaFactory.createForClass(RoomMessage);