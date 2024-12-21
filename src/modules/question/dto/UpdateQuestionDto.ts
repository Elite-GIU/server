import { PartialType } from '@nestjs/swagger';
import { CreateQuestionDto } from './CreateQuestionDto';

export class UpdateQuestionDto extends PartialType(CreateQuestionDto) {

    question?: string;

    choices?: string[];

    right_choice?: string;

    difficulty?: number;

    type?: string;

}