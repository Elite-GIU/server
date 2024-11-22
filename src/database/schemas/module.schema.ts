
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: false } })
export class ModuleEntity extends Document {
  @Prop({ type: Types.ObjectId, required: true, ref: 'Course' })
  course_id: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ type: [String], required: true })
  content: string[];

  @Prop({ type: [String], default: [] })
  resources: string[];
}

export const ModuleSchema = SchemaFactory.createForClass(ModuleEntity);