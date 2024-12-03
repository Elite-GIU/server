import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, ArrayNotEmpty } from 'class-validator';
export class UpdateUserDto {
    @ApiProperty({ description: 'The name of the user', example: 'John Doe' })
    @IsString()
    name: string;

    @ApiProperty({ description: 'The preferences of the user', type: [String], example: ['sports', 'music'] })
    @IsArray()
    @ArrayNotEmpty()
    preferences: string[];
}
