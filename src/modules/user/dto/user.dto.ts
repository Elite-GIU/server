import { IsString, IsEmail, IsEnum, IsArray, ArrayNotEmpty, IsOptional, IsNotEmpty } from 'class-validator';;


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
  @IsOptional()
  preferences?: string[];
}