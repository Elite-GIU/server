import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: false }})
export class Question extends Document {

  @Prop({ required: true })
  question: string;

  @Prop({ 
    type: [String], 
    required: true,
    validate: {
      validator: function(choices: string[]) {
        return choices.length === 2 || choices.length === 4;
      },
      message: 'Choices array must have exactly 2 or 4 items'
    }
  })
  choices: string[];

  @Prop({ 
    required: true,
    validate: {
      validator: function(choice: string) {
        return this.choices.includes(choice);
      },
      message: 'Right choice must be one of the provided choices'
    }
   })
  right_choice: string;

  @Prop({ required: true, min: 1, max: 3})
  difficulty: number;

  @Prop({
    required: true,
    enum: ['mcq', 'true_false'],
    default: 'mcq',
  })
  type: string;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);