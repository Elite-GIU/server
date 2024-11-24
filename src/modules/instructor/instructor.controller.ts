import { Controller, Get, UseGuards } from '@nestjs/common';
import { InstructorGuard } from '../../common/guards/instructor.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Instructor')
@ApiBearerAuth()
@Controller('instructor')
@UseGuards(JwtAuthGuard, InstructorGuard)
export class InstructorController {
  @Get()
  @ApiOperation({ summary: 'Get Instructor Details' })
  @ApiResponse({
    status: 200,
    description: 'Instructor details successfully retrieved.',
  }) 
  @ApiResponse({
    status: 403,
    description: 'Forbidden: Only instructors are allowed to access this endpoint.',
  }) 
  @ApiResponse({
    status: 401,
    description: 'Unauthorized: Missing or invalid token.',
  }) 
  findInstructor() {
    return 'This route is accessible only to instructors.';
  }
}
