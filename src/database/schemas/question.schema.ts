import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: false }})
export class Question extends Document {

  @Prop({ required: true })
  question: string;

  @Prop({ type: [String], required: true, minlength: 4, maxlength: 4 })
  choices: string[];

  @Prop({ required: true })
  right_choice: string;

  @Prop({ required: true, min: 1, max: 3})
  difficulty: number;

  @Prop({
    required: true,
    enum: ['mcq', 'true_false', 'essay','mix'],
    default: 'mcq',
  })
  type: string;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);