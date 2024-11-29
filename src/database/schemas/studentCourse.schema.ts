import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: false } })
export class StudentCourse extends Document {
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  user_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: 'Course' })
  course_id: Types.ObjectId;

  @Prop({ required: true })
  completion_percentage: number; 

  @Prop({ type: [Date], default: [] })
  last_accessed: Date[];

  @Prop({
    type: String,
    enum: ['enrolled', 'completed', 'failed'],
    default: 'enrolled', 
    required: true,
  })
  status: string; 

}

export const StudentCourseSchema = SchemaFactory.createForClass(StudentCourse);