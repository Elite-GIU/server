import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsIn,
  IsArray,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class RegisterUserDto {
  @ApiProperty({
    description: 'The email of the user',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'The password of the user (must be strong)',
    example: 'StrongPassword123!',
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: 'The full name of the user',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The role of the user',
    example: 'student',
    enum: ['student', 'instructor'],
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['student', 'instructor'])
  role: string;

  @ApiProperty({
    description: 'The preferences of the user (e.g., topics of interest)',
    example: ['math', 'science', 'technology'],
  })
  @IsArray()
  @IsNotEmpty()
  @IsString({ each: true })
  preferences: string[];

  @IsOptional()
  @IsString()
  emailVerificationOtp?: string;

  @IsOptional()
  @IsDateString()
  emailVerificationOtpCreatedAt?: string

  @IsOptional()
  @IsDateString()
  emailVerificationOtpExpiresAt?: string;
}
