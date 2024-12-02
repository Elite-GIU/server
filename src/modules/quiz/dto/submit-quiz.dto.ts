import { ArrayNotEmpty, IsArray } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class SubmitQuizDto {
  @IsArray()
  @ArrayNotEmpty()
  @ApiProperty({
    description: 'The questions of the quiz',
    example: ['648a1e9b9f4e2d1a1b2c3d4e', '648a1e9b9f4e2d1a1b2c3d4f']
  })
  questions: string[];

  @IsArray()
  @ArrayNotEmpty()
  @ApiProperty({
    description: 'The answers of the quiz',
    example: ['A', 'B']
  })
  answers: string[];
} 