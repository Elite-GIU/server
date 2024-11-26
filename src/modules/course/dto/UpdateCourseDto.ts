import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCourseDto {
  
  @ApiProperty()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(3)
  difficulty_level?: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  title?: string
}
