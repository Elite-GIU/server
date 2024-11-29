import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';


@Schema({ timestamps: true })
export class Questionbank extends Document {
  @Prop({ type: Types.ObjectId, required: true, ref: 'ModuleEntity' })
  module_id: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], required: true, ref: 'Question' })
  questions: Types.ObjectId[];

}

export const QuestionbankSchema = SchemaFactory.createForClass(Questionbank);