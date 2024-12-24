import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { DatabaseModule } from '../../database/database.module';
import { LogsModule } from '../logs/logs.module';
import { LogsService } from '../logs/logs.service';

@Module({
  imports: [DatabaseModule,LogsModule],
  controllers: [DashboardController],
  providers: [DashboardService,LogsService],
})
export class DashboardModule {}
