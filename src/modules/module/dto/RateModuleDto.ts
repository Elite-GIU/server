import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RateModuleDto {
  
  @ApiProperty()
  @IsNumber()  
  @Min(1)   
  @Max(5)   
  rate: number;
}