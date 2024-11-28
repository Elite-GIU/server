import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: { createdAt: 'upload_date', updatedAt: 'last_updated' } })
export class Content extends Document {

  @Prop({ required: true })
  title: string; // Title of the content

  @Prop({ required: true })
  description: string; // Description of the content

  @Prop({ required: true })
  author: string; // Name or ID of the instructor uploading the content

  @Prop({
    required: true,
    enum: ['video', 'document', 'quiz', 'assignment'], // Type of content
    default: 'document',
  })
  type: string;

  @Prop({ required: true, default: true })
  isVisible: boolean; // Whether the content is visible to students

  //TODO - Check if this is correct in the next meeting
  @Prop({ required: false })
  // content: string | object; // Inline content for assignments, etc.
  content: string; 

  @Prop({ required: false })
  contentUrl: string; // URL to the content file (videos, documents, etc.)

}

export const ContentSchema = SchemaFactory.createForClass(Content);
