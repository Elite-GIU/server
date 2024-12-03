import { IsNotEmpty, IsString, IsArray, ArrayNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InstructorDataDto {
    @ApiProperty({
        description: 'The name of the instructor',
        example: 'John Doe',
    })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({
        description: 'The email of the instructor',
        example: 'john.doe@example.com',
    })
    @IsNotEmpty()
    @IsString()
    email: string;

    @ApiProperty({
        description: 'The preferences of the instructor',
        example: ['preference1', 'preference2'],
    })
    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    preferences: string[];
}