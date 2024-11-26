import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class RoomMessageDto {
  @ApiProperty({
    description: 'The sender ID of the message',
    example: '60f1b3b3b9b3f3f3f3f3f3f3',
  })
  @IsString()
  @IsNotEmpty()
  senderId: string;

  @ApiProperty({
    description: 'The content of the message',
    example: 'Hello, how are you?',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}
