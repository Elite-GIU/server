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
import { UpdateContentDto } from './dto/UpdateContentDto';
import { multerConfig } from '../../config/multer.config';
import { StudentGuard } from 'src/common/guards/student.guard';
import { GetUser } from 'src/common/decorators/getUser.decorator';

@ApiTags('Modules')
@Controller()
export class ModuleController {
  constructor(private readonly moduleService: ModuleService) {}

  @Get('instructor/courses/:courseId/modules')
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
    @AssignedParam(
      {
        modelName: 'Course',
        firstAttrName: 'instructor_id',
        secondAttrName: '_id',
        firstKey: 'userId',
        secondKey: 'courseId',
      },
      CheckAssignedValidatorPipe,
    ) course: { _id: string },
    @Query('sortOrder') sortOrder: string,
  ) {
    return await this.moduleService.getModulesHierarchy(course._id, sortOrder);
  }

  @Get('instructor/courses/:courseId/modules/:moduleId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, InstructorGuard)
  @ApiOperation({ summary: 'Get a specific module' })
  @ApiResponse({ status: 200, description: 'Module retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Module not found.' })
  @ApiParam({ name: 'courseId', description: 'Course ID', type: String })
  @ApiParam({ name: 'moduleId', description: 'Module ID', type: String })
  async getModuleById(
    @AssignedParam(
      {
        modelName: 'Course',
        firstAttrName: 'instructor_id',
        secondAttrName: '_id',
        firstKey: 'userId',
        secondKey: 'courseId',
      },
      CheckAssignedValidatorPipe,
    ) course: { _id: string },
    @AssignedParam(
      {
        modelName: 'ModuleEntity',
        firstAttrName: 'course_id',
        secondAttrName: '_id',
        firstKey: 'courseId',
        secondKey: 'moduleId',
      },
      CheckAssignedValidatorPipe,
    ) module: { _id: string },
  ) {
    return await this.moduleService.getModuleById(course._id, module._id);
  }

  @Get('student/courses:courseId/modules/:moduleId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, StudentGuard)
  @ApiOperation({ summary: 'Get a specific module for a student' })
  @ApiResponse({ status: 200, description: 'Module retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Module not found.' })
  @ApiParam({ name: 'courseId', description: 'Course ID', type: String })
  @ApiParam({ name: 'moduleId', description: 'Module ID', type: String })
  async getStudentModuleById(
    @AssignedParam(
      {
      modelName: 'StudentCourse', 
      firstAttrName: 'user_id', 
      secondAttrName: 'course_id', 
      firstKey: 'userId', 
      secondKey: 'courseId',
      },
      CheckAssignedValidatorPipe,
    ) course: { course_id: string },
    @AssignedParam(
      {
        modelName: 'ModuleEntity',
        firstAttrName: 'course_id',
        secondAttrName: '_id',
        firstKey: 'courseId',
        secondKey: 'moduleId',
      },
      CheckAssignedValidatorPipe,
    ) module: { _id: string },
    @GetUser('userId') userId: string
  ) {
    return await this.moduleService.getStudentModuleById(course.course_id, module._id, userId);
  }

  @Post('instructor/courses/:courseId/modules')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, InstructorGuard)
  @ApiOperation({ summary: 'Create a new module for a course' })
  @ApiResponse({ status: 201, description: 'Module created successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input data or validation failed.' })
  @ApiResponse({ status: 404, description: 'Course not found or not assigned to instructor.' })
  @ApiParam({ name: 'courseId', description: 'Course ID', type: String })
  async createModule(
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
    return await this.moduleService.createModule(course._id, createModuleDto);
  }

  @Post('instructor/courses/:courseId/modules/:moduleId/upload')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, InstructorGuard)
  @ApiOperation({ summary: 'Upload content to a specific module of a course' })
  @ApiResponse({ status: 201, description: 'Content uploaded successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request or invalid file.' })
  @ApiParam({ name: 'courseId', description: 'Course ID', type: String })
  @ApiParam({ name: 'moduleId', description: 'Module ID', type: String })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async uploadContent(
    @Body() uploadContentDto: UploadContentDto,
    @AssignedParam(
      {
        modelName: 'Course',
        firstAttrName: 'instructor_id',
        secondAttrName: '_id',
        firstKey: 'userId',
        secondKey: 'courseId',
      },
      CheckAssignedValidatorPipe,
    ) course: { _id: string },
    @AssignedParam(
      {
        modelName: 'ModuleEntity',
        firstAttrName: 'course_id',
        secondAttrName: '_id',
        firstKey: 'courseId',
        secondKey: 'moduleId',
      },
      CheckAssignedValidatorPipe,
    ) module: { _id: string },
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
    return await this.moduleService.uploadContent(module._id, uploadContentDto, file);
  }

  @Put(':courseId/modules/:moduleId/update/:contentId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, InstructorGuard)
  @ApiOperation({ summary: 'Update content of a specific module of a course' })
  @ApiResponse({ status: 201, description: 'Content updated successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request or invalid file.' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  @ApiParam({ name: 'courseId', required: true, description: 'ID of the course' })
  @ApiParam({ name: 'moduleId', required: true, description: 'ID of the module' })
  @ApiParam({ name: 'contentId', required: true, description: 'ID of the content to be updated' })
  async updateContent(
    @AssignedParam(
      {
        modelName: 'Course',
        firstAttrName: 'instructor_id',
        secondAttrName: '_id',
        firstKey: 'userId',
        secondKey: 'courseId',
      },
      CheckAssignedValidatorPipe,
    ) course: { _id: string },
    @AssignedParam(
      {
        modelName: 'ModuleEntity',
        firstAttrName: 'course_id',
        secondAttrName: '_id',
        firstKey: 'courseId',
        secondKey: 'moduleId',
      },
      CheckAssignedValidatorPipe,
    ) module: { _id: string },
    @Param('contentId') contentId: string,
    @Body() updateContentDto: UpdateContentDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: '.(pdf|doc|docx|ppt|pptx|jpg|jpeg|png|mp4)' }),
          new MaxFileSizeValidator({ maxSize: 100 * 1024 * 1024 }), // 100MB
        ],
        fileIsRequired: false,
      }),
    )
    file?: Express.Multer.File,
  ) {
    try {
      return await this.moduleService.updateContent(module._id, contentId, updateContentDto, file);
  } catch (error) {
      console.error('Error updating content:', error);
      throw new BadRequestException('Failed to update content. Please check the input values.');
  }
    }
  }
