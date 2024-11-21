import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: { createdAt: 'submitted_at', updatedAt: false } })
export class Response extends Document {
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  user_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: 'Quiz' })
  quiz_id: Types.ObjectId;

  @Prop({ type: [String], required: true })
  answers: string[]; 

  @Prop({ required: true })
  score: number; 

  @Prop({ type: Date, default: Date.now })
  submitted_at: Date;
}

export const ResponseSchema = SchemaFactory.createForClass(Response);
