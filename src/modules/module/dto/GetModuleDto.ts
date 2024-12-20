import { IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class GetModuleDto {
  @IsMongoId()
  @IsNotEmpty()
  course_id: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsEnum(['mcq', 'true_false', 'mix'], { message: 'assessmentType must be one of: mcq, true_false, mix' })
  @IsNotEmpty()
  assessmentType: string;

  @IsNumber()
  @IsNotEmpty()
  numberOfQuestions: number;

  @IsNumber()
  @IsNotEmpty()
  passingGrade: number;

  @IsString()
  @IsNotEmpty()
  _id: Types.ObjectId;
}
