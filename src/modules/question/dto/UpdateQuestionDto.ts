import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateQuestionDto } from './CreateQuestionDto';
import { IsArray, IsEnum, IsNumber, IsString, Max, Min, Validate } from 'class-validator';

function IsTwoOrFourChoices() {
  return Validate((value: string[], obj: CreateQuestionDto) => {
    return value.length === 2 || value.length === 4;
  }, {
    message: 'Choices must have either 2 or 4 items.'
  });
}
export class UpdateQuestionDto extends PartialType(CreateQuestionDto) {

    @ApiProperty({
        description: 'The question text',
        example: 'What is the capital of France?'
      })
      @IsString()
      question?: string;
    
      @ApiProperty({
        description: 'Array of possible answers',
        example: ['Paris', 'London', 'Berlin', 'Madrid'],
        minItems: 2,
        maxItems: 4
      })
      @IsArray()
      @IsTwoOrFourChoices()
      @IsString({ each: true })
      choices?: string[];
    
      @ApiProperty({
        description: 'The correct answer',
        example: 'Paris'
      })
      @IsString()
      right_choice?: string;
    
      @ApiProperty({
        description: 'Question difficulty level (1-3)',
        minimum: 1,
        maximum: 3,
        example: 2
      })
      @IsNumber()
      @Min(1)
      @Max(3)
      difficulty?: number;
    
      @ApiProperty({
        description: 'Question type',
        enum: ['mcq', 'true_false'],
        example: 'mcq'
      })
      @IsEnum(['mcq', 'true_false'])
      type?: string;

}


