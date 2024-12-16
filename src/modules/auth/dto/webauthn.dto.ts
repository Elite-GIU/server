import { IsString, IsEmail, IsNotEmpty } from 'class-validator';

export class WebAuthnDto {
  @IsEmail({}, { message: 'Invalid email format.' })
  @IsNotEmpty({ message: 'Email is required.' })
  email: string;

  @IsString({ message: 'Browser fingerprint must be a string.' })
  @IsNotEmpty({ message: 'Browser fingerprint is required.' })
  browserFingerprint: string;
}

