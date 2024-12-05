import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ThreadDto {
  @ApiProperty({
    description: 'The title of the thread',
    example: "Today's task",
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'The description of the thread',
    example:
      "Hello, what is todays task's solution? I have tried but I am stuck.",
  })
  @IsString()
  @IsNotEmpty()
  description: string;
}
