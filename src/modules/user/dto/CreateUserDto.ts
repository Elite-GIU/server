import { IsString, IsEmail, IsEnum, IsArray, ArrayNotEmpty, IsOptional, IsNotEmpty, IsDateString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsEnum(['admin', 'instructor', 'student'])
  @IsNotEmpty()
  role: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsNotEmpty()
  preferences?: string[];

  @IsString()
  @IsOptional()
  emailVerificationOtp?: string;

  @IsOptional()  
  @IsDateString()
  emailVerificationOtpCreatedAt?: Date;
  
  @IsOptional()
  @IsDateString()
  emailVerificationOtpExpiresAt?: Date;
}