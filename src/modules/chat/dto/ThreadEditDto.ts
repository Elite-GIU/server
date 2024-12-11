import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ThreadEditDto {
  @ApiProperty({
    description: 'The title of the thread',
    example: "Today's task",
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: 'The description of the thread',
    example:
      "Hello, what is todays task's solution? I have tried but I am stuck.",
  })
  @IsOptional()
  @IsString()
  description?: string;
}
