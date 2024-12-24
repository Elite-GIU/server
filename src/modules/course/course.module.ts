import { Module } from '@nestjs/common';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';
import { DatabaseModule } from '../../database/database.module';
import { Log } from '../../database/schemas/log.schema';
import { LogsModule } from '../logs/logs.module';
import { LogsService } from '../logs/logs.service';

@Module({
  imports: [DatabaseModule,LogsModule],
  controllers: [CourseController],
  providers: [CourseService,LogsService],
})
export class CourseModule {}
