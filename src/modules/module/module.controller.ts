import { Controller, Post, Get, Put, Delete, Param, Body, UseGuards, UploadedFile, UseInterceptors, BadRequestException, ParseFilePipe, FileTypeValidator, MaxFileSizeValidator ,Query} from '@nestjs/common';
import { ModuleService } from './module.service';
import { JwtAuthGuard } from 'src/modules/auth/jwt-auth.guard';
import { InstructorGuard } from 'src/common/guards/instructor.guard';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags, ApiConsumes ,ApiQuery} from '@nestjs/swagger';
import { CreateModuleDto } from './dto/CreateModuleDto';
import { AssignedParam } from 'src/common/decorators/assignedParam.decorator';
import { CheckAssignedValidatorPipe } from 'src/common/pipes/check-assigned-validator.pipe';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadContentDto } from './dto/UploadContentDto';
import { multerConfig } from './config/multer.config';

@ApiTags('Modules')
@Controller('instructor/courses')
export class ModuleController {
  constructor(private readonly moduleService: ModuleService) {}

  @Get(':courseId/modules') //check courseId exist
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, InstructorGuard)
  @ApiOperation({ summary: 'Get all modules for a course' })
  @ApiResponse({ status: 200, description: 'Modules retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Course not found.' })
  @ApiParam({ name: 'courseId', description: 'Course ID', type: String })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: 'Sort order of the modules (asc or desc)',
    schema: {
      type: 'string',
      enum: ['asc', 'desc'],
      default: 'asc',
    },
  })
  async getModules(
    @Param('courseId') courseId: string,
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'asc',
  ) {
    return await this.moduleService.getModulesHierachy(courseId); //change method to getModules
  }

  @Get(':courseId/modules/:moduleId') //check courseId exist
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, InstructorGuard)
  @ApiOperation({ summary: 'Get a specific module' })
  @ApiResponse({ status: 200, description: 'Module retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Module not found.' })
  @ApiParam({ name: 'courseId', description: 'Course ID', type: String })
  @ApiParam({ name: 'moduleId', description: 'Module ID', type: String })
  async getModuleById(
    @Param('courseId') courseId: string,
    @Param('moduleId') moduleId: string,
  ) {
    return await this.moduleService.getModuleById(courseId, moduleId);
  }

  @Post(':courseId/modules')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, InstructorGuard)
  @ApiOperation({ summary: 'Create a new module for a course' })
  @ApiResponse({ status: 201, description: 'Module created successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input data or validation failed.' })
  @ApiResponse({ status: 404, description: 'Course not found or not assigned to instructor.' })
  @ApiParam({ name: 'courseId', description: 'Course ID', type: String })
  async createModule(
    @Param('courseId') courseId: string,
    @Body() createModuleDto: CreateModuleDto,
    @AssignedParam(
      {
        modelName: 'Course',
        firstAttrName: 'instructor_id',
        secondAttrName: '_id',
        firstKey: 'userId',
        secondKey: 'courseId',
      },
      CheckAssignedValidatorPipe,
    )
    course: { _id: string },
  ) {
    if (!course) {
      throw new BadRequestException('Course validation failed: Instructor does not own the course.');
    }

    const existingModule = await this.moduleService.findModuleByTitle(course._id, createModuleDto.title);
    if (existingModule) {
      throw new BadRequestException('Module with this title already exists in the course.');
    }

    return await this.moduleService.createModule(course._id, createModuleDto);
  }

  @Post(':courseId/modules/:moduleId/upload')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, InstructorGuard)
  @ApiOperation({ summary: 'Upload content to a specific module of a course' })
  @ApiResponse({ status: 201, description: 'Content uploaded successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request or invalid file.' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async uploadContent(
    @Param('courseId') courseId: string,
    @Param('moduleId') moduleId: string,
    @Body() uploadContentDto: UploadContentDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: '.(pdf|doc|docx|ppt|pptx|jpg|jpeg|png|mp4)' }),
          new MaxFileSizeValidator({ maxSize: 100 * 1024 * 1024 }), // 100MB
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return await this.moduleService.uploadContent(courseId, moduleId, uploadContentDto, file);
  }

 
}