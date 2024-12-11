import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ThreadEditDto {
  @ApiProperty({
    description: 'The title of the thread',
    example: "Today's task",
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'The description of the thread',
    example:
      "Hello, what is todays task's solution? I have tried but I am stuck.",
  })
  @IsString()
  description: string;
}
