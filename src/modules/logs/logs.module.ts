import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LogsController } from './logs.controller';
import { LogsService } from './logs.service';
import { Log, LogSchema } from '../../database/schemas/log.schema';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [
    DatabaseModule,
    MongooseModule.forFeature([{ name: Log.name, schema: LogSchema }]),
  ],
  controllers: [LogsController],
  providers: [LogsService],
  exports: [LogsService], // Ensure LogsService is exported
})
export class LogsModule {}
