import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { IsOptionalMinLength } from '../../../common/decorators/optional-min-length.decorator';

enum ContentType {
  Video = 'video',
  Document = 'document',
  Website = 'website',
  Assignment = 'assignment',
  Tutorial = 'tutorial',
  Slides = 'slides',
}
export class UpdateContentDto {
  @ApiPropertyOptional({
    description: 'Title of the content being updated',
    minLength: 3,
  })
  @IsOptionalMinLength(3)
  title?: string;

  @ApiPropertyOptional({
    description: 'Description of the content being updated',
    minLength: 10,
  })
  @IsOptionalMinLength(10)
  description?: string;

  @ApiPropertyOptional({
    description: 'Type of the content being updated',
    enum: ['video', 'document', 'website', 'assignment', 'tutorial', 'slides'],
  })
  @IsOptional()
  @IsEnum(ContentType)
  type?: ContentType | null;
  
  @ApiPropertyOptional({
    description: 'The file being updated',
    type: 'string',
    format: 'binary',
  })
  @IsOptional()
  file?: any;
}
