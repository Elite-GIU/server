import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: false } })
export class Course extends Document {
  @Prop({ required: true })
  instructor_id: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true, min: 1, max: 3 })
  difficulty_level: number;
}

export const CourseSchema = SchemaFactory.createForClass(Course);
