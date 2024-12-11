import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddRatingDto {
  
  @ApiProperty()
  @IsOptional() 
  @IsNumber() 
  @Min(1)   
  @Max(5)   
  course_rate?: number;

  @ApiProperty()
  @IsOptional() 
  @IsNumber()  
  @Min(1)   
  @Max(5)   
  instructor_rate?: number;


}