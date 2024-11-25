import { IsString, IsNumber, IsNotEmpty, Min, Max } from 'class-validator';

export class CreateCourseDto {

    @IsNotEmpty({ message: 'Category must not be empty' })
    @IsString({ message: 'Category must be a string' })
    category: string;

    @IsNotEmpty({ message: 'Description must not be empty' })
    @IsString({ message: 'Description must be a string' })
    description: string;

    @IsNotEmpty({ message: 'Difficulty level must not be empty' })
    @IsNumber({}, { message: 'Difficulty level must be a number' })
    @Min(1, { message: 'Difficulty level must be at least 1' })
    @Max(3, { message: 'Difficulty level must be at most 3' })
    difficulty_level: number;
}
