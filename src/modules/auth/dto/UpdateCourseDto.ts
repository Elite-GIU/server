import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class UpdateCourseDto {
  
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(3)
  difficulty_level?: number;
}
