import { ModuleService } from './module.service';
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { GetUser } from 'src/common/decorators/getUser.decorator';
import { JwtAuthGuard } from 'src/modules/auth/jwt-auth.guard';
import { StudentGuard } from 'src/common/guards/student.guard';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ExistParam } from 'src/common/decorators/existParam.decorator';
import { CheckExistValidatorPipe } from 'src/common/pipes/check-exist-validator.pipe';
import { AssignedParam } from 'src/common/decorators/assignedParam.decorator';
import { CheckAssignedValidatorPipe } from 'src/common/pipes/check-assigned-validator.pipe';

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
  @ApiParam({ name: 'courseId', description: 'Course ID', type: String })
  @ApiParam({ name: 'moduleId', description: 'Module ID', type: String })
  getModuleContent(
    @GetUser('userId')
    @Param('courseId')
    @Param('moduleId') moduleId: string,
    // TODO: review the commented code below
    // @AssignedParam({
    //   modelName: 'StudentCourse', 
    //   firstAttrName: 'user_id', 
    //   secondAttrName: 'course_id', 
    //   firstKey: 'userId',
    //   secondKey: 'courseId',
    //  }, CheckAssignedValidatorPipe) 
    // @AssignedParam({
    //   modelName: 'ModuleEntity', 
    //   firstAttrName: '_id', 
    //   secondAttrName: 'course_id', 
    //   firstKey: 'moduleId', 
    //   secondKey: 'courseId',
    // }, CheckAssignedValidatorPipe) moduleId: string,
  ) {
    return this.moduleService.getModuleContent(moduleId);
  }
}
