import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ModuleController } from './module.controller';
import { ModuleService } from './module.service';
import { DatabaseModule } from 'src/database/database.module';
import { multerConfig } from '../../config/multer.config';

@Module({
  imports: [
    DatabaseModule, 
    MulterModule.register(multerConfig),
  ],
  controllers: [ModuleController],
  providers: [ModuleService],
})
export class ModuleModule {}