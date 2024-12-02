import { PartialType } from '@nestjs/swagger';
import { CreateQuestionDto } from './CreateQuestionDto';

export class UpdateQuestionDto extends PartialType(CreateQuestionDto) {}