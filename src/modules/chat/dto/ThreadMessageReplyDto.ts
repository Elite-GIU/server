import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ThreadMessageReplyDto {
  @ApiProperty({
    description: 'The content of the message',
    example: 'Hello, how are you?',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}
