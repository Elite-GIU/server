import { IsNotEmpty, IsEnum, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Multer } from 'multer';

export class UploadContentDto {
  @ApiProperty({
    description: 'Title of the content being uploaded',
    minLength: 3,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  title: string;

  @ApiProperty({
    description: 'Description of the content being uploaded',
    minLength: 10,
  })
  @IsNotEmpty()
  @IsString()
  //@MinLength(10)
  description: string;

  @ApiProperty({
    description: 'Type of the content being uploaded',
    enum: ['video', 'document', 'website', 'assignment', 'tutorial', 'slides'],
  })
  @IsEnum(['video', 'document', 'website', 'assignment', 'tutorial', 'slides'])
  type: string;

  @ApiProperty({
    description: 'The file being uploaded',
    type: 'string',
    format: 'binary',
    required: false,
  })
  file?: Express.Multer.File; // Optional since it's handled by @UploadedFile()
}