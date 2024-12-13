
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ESLint } from 'eslint';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: false } })
export class ModuleEntity extends Document {
  @Prop({ type: Types.ObjectId, required: true, ref: 'Course' })
  course_id: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ type: [Types.ObjectId], required: false,  ref: 'Content'})
  content: Types.ObjectId[];

  @Prop({
    required: true,
    enum: ['mcq', 'true_false','mix'],
    default: 'mcq',
  })
  assessmentType: String;

  @Prop({ required: true })
  numberOfQuestions: Number;

  @Prop({ required: true })
  passingGrade: Number;

  @Prop({ type: [Number], default: [0, 0, 0, 0, 0], required: true })
  ratings: number[];
}

export const ModuleSchema = SchemaFactory.createForClass(ModuleEntity);