import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class User extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, enum: ['admin', 'instructor', 'student'] })
  role: string;

  @Prop({ type: [String], default: [] })
  preferences: string[];

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop()
  emailVerificationOtp?: string;

  @Prop()
  emailVerificationOtpCreatedAt?: Date;

  @Prop()
  emailVerificationOtpExpiresAt?: Date;

  @Prop()
  currentChallenge?: string;

  @Prop({
    type: {
      credentialID: { type: Buffer, required: true },
      publicKey: { type: Buffer, required: true },
      counter: { type: Number, required: true },
      transports: { type: [String], required: true },
    },
    default: null
  })
  webAuthnCredentials: {
    credentialID: Buffer;
    publicKey: Buffer;
    counter: number;
    transports: string[];
  };

  @Prop()
  biometricHash?: string;

  @Prop({
    type: [Number],
    default: function (this: User) {
      return this.role === 'instructor' ? [0, 0, 0, 0, 0] : undefined;
    },
    required: function (this: User) {
      return this.role === 'instructor';
    },
  })
  ratings: number[];

}

export const UserSchema = SchemaFactory.createForClass(User);
