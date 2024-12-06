import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class QuizResponse extends Document {
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  user_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: 'ModuleEntity' })
  module_id: Types.ObjectId;

  @Prop({type: [Types.ObjectId], required: true, ref: 'Question'})
  questions : Types.ObjectId[]

  @Prop({ type: [String], required: false })
  answers: string[]; 

  @Prop({ required: false })
  score: number; 

  @Prop({ 
    required: false, 
    enum: ['passed', 'failed'],
    default: 'failed'})
  finalGrade: string; 

}

export const QuizResponseSchema = SchemaFactory.createForClass(QuizResponse);
