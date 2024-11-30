import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: { createdAt: 'upload_date', updatedAt: 'last_updated' } })
export class Content extends Document {

  @Prop({ required: true })
  title: string; 

  @Prop({ required: true })
  description: string;

  @Prop({
    required: true,
    enum: ['video', 'document', 'website', 'assignment', 'tutorial', 'slides'],
    default: 'document',
  })
  type: string;

  @Prop({ required: true, default: true })
  isVisible: boolean;

  @Prop({ required: false })
  content: string; 

}

export const ContentSchema = SchemaFactory.createForClass(Content);
