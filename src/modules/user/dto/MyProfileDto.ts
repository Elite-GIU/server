import { IsEmail, IsEnum, IsString, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

enum UserRole {
    ADMIN = 'admin',
    INSTRUCTOR = 'instructor',
    STUDENT = 'student',
}
export class MyProfileDto {
    @ApiProperty({ description: 'The name of the user', example: 'John Doe' })
    @IsString()
    name: string;

    @ApiProperty({ description: 'The email of the user', example: 'john.doe@example.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ description: 'The role of the user', enum: UserRole, example: UserRole.STUDENT })
    @IsEnum(UserRole)
    role: UserRole;

    @ApiProperty({ description: 'The preferences of the user', type: [String], example: ['dark mode', 'email notifications'] })
    @IsArray()
    @IsString({ each: true })
    preferences: string[];
}
