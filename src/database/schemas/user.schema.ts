import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: false } })
export class User extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, enum: ['admin', 'instructor', 'student'] })
  role: string;

  @Prop({ type: [String], default: [], required: true })
  preferences: string[];

  @Prop({ default: false, required: true })
  isEmailVerified: boolean;

  @Prop({ required: false })
  emailVerificationOtp: string;

  @Prop({ required: false })
  emailVerificationOtpCreatedAt: Date;
  
  @Prop({ required: false })
  emailVerificationOtpExpiresAt: Date; 
}

export const UserSchema = SchemaFactory.createForClass(User);
