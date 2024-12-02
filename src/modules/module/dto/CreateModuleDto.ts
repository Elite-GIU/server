import { IsNotEmpty, IsNumber, IsString, IsEnum, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateModuleDto {
  @ApiProperty({
    description: 'Title of the module',
    example: 'Introduction to AI',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Number of questions in the assessment',
    example: 10,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(500)
  nrOfQuestions: number;

  @ApiProperty({
    description: 'Type of assessment',
    example: 'mcq',
    enum: ['mcq', 'true_false', 'mix'],
  })
  @IsNotEmpty()
  @IsEnum(['mcq', 'true_false', 'mix'])
  assessmentType: string;
}
