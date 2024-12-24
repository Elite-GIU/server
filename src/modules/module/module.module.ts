import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ModuleController } from './module.controller';
import { ModuleService } from './module.service';
import { DatabaseModule } from '../../database/database.module';
import { multerConfig } from '../../config/multer.config';
import { LogsModule } from '../logs/logs.module';
import { LogsService } from '../logs/logs.service';

@Module({
  imports: [
    DatabaseModule, 
    MulterModule.register(multerConfig),
    LogsModule
  ],
  controllers: [ModuleController],
  providers: [ModuleService, LogsService],
})
export class ModuleModule {}