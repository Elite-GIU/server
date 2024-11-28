import { ModuleService } from './module.service';
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { GetUser } from 'src/common/decorators/getUser.decorator';
import { JwtAuthGuard } from 'src/modules/auth/jwt-auth.guard';
import { StudentGuard } from 'src/common/guards/student.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Modules')
@Controller()
export class ModuleController {
  constructor(private readonly moduleService: ModuleService) {}

  @Get('student/course/:courseId/modules/:moduleId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, StudentGuard)
  @ApiOperation({ summary: 'Get module content for the authenticated student' })
  @ApiResponse({
    status: 200,
    description: 'Module content retrieved successfully.',
  })
  @ApiResponse({ status: 404, description: 'Module not found or student not enrolled in course.' })
  getModuleContent(
    @GetUser('userId') userId: string,
    @Param('courseId') courseId: string,
    @Param('moduleId') moduleId: string,
  ) {
    return this.moduleService.getModuleContent(userId, courseId, moduleId);
  }
}
