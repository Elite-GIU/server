import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsNotEmpty, Min, Max, IsOptional, IsArray } from 'class-validator';

export class CreateCourseDto {

    @ApiProperty()
    @IsNotEmpty({ message: 'Category must not be empty' })
    @IsString({ message: 'Category must be a string' })
    category: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'Description must not be empty' })
    @IsString({ message: 'Description must be a string' })
    description: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'Difficulty level must not be empty' })
    @IsNumber({}, { message: 'Difficulty level must be a number' })
    @Min(1, { message: 'Difficulty level must be at least 1' })
    @Max(3, { message: 'Difficulty level must be at most 3' })
    difficulty_level: number;

    @ApiProperty()
    @IsNotEmpty({ message: 'Title must not be empty' })
    @IsString({ message: 'Title must be a string' })
    title: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'keywords must not be empty' })
    @IsArray({ message: 'keywords must be an array of string' })
    keywords: Array<string>;
}
