import { ModuleService } from './module.service';
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('module')
@UseGuards(AuthGuard())
export class ModuleController {
  constructor(private readonly moduleService: ModuleService) {}

  @Get('student/course/:courseId/modules/:moduleId')
  getModuleContent(
    @GetUser('userId') userId: string,
    @Param('courseId') courseId: string,
    @Param('moduleId') moduleId: string,
  ) {
    return this.moduleService.getModuleContent(userId, courseId, moduleId);
  }
}
