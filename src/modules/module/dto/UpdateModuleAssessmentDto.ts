import { IsNotEmpty, IsNumber, IsEnum, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateModuleAssessmentDto {
  @ApiProperty({
    description: 'Type of assessment',
    example: 'mcq',
    enum: ['mcq', 'true_false', 'mix'],
  })
  @IsNotEmpty()
  @IsEnum(['mcq', 'true_false', 'mix'])
  assessmentType: string;

  @ApiProperty({
    description: 'Number of questions in the assessment',
    example: 10,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(500)
  numberOfQuestions: number;

  @ApiProperty({
    description: 'Minimum grade required to pass the quiz in this module',
    example: 60,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(100)
  passingGrade: number;
}