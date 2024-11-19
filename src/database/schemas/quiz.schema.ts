import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: false })
class Question {
  @Prop({ type: Types.ObjectId, auto: true })
  question_id: Types.ObjectId;

  @Prop({ required: true })
  question: string;

  @Prop({ type: [String], required: true, minlength: 4, maxlength: 4 })
  choices: string[];

  @Prop({ required: true })
  right_choice: string;
}

const QuestionSchema = SchemaFactory.createForClass(Question);

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: false } })
export class Quiz extends Document {
  @Prop({ type: Types.ObjectId, required: true, ref: 'Module' })
  module_id: Types.ObjectId;

  @Prop({ type: [QuestionSchema], required: true })
  questions: Question[];

  @Prop({ type: Date, default: Date.now })
  created_at: Date;
}

export const QuizSchema = SchemaFactory.createForClass(Quiz);