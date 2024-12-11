import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: false } })
export class Course extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  instructor_id: Types.ObjectId;

  @Prop({ required: true })
  title: string;
  
  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true, min: 1, max: 3 })
  difficulty_level: number;

  @Prop({ type: [Number], default: [0, 0, 0, 0, 0], required: true })
  ratings: number[];
}

export const CourseSchema = SchemaFactory.createForClass(Course);
