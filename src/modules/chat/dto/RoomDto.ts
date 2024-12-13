import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class RoomDto {
  @ApiProperty({
    description: 'The members list of the study room',
    example: ['60f8c7b3b7e1f3001c3d2d4e'],
  })
  @IsString({ each: true })
  @IsNotEmpty()
  members_list: string[];

  @ApiProperty({
    description: 'The title of the study room',
    example: 'AI Study Room',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'The description of the study room',
    example: 'This is a study room for the AI course',
  })
  @IsString()
  @IsNotEmpty()
  description: string;
}
