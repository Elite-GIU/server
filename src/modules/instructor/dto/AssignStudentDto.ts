import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignStudentDto {
  @ApiProperty({
    description: 'The student ID or email to assign to the course',
    example: 'student123@example.com',
  })
  @IsNotEmpty()
  @IsString()
  studentIdentifier: string;

  @ApiProperty({
    description: 'The course ID to which the student will be assigned',
    example: '648f9e5a8c7e3d1f2e3c4d5b',
  })
  @IsNotEmpty()
  @IsString()
  courseId: string;
}