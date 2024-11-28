import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseConfig } from '../config/database.config';
import { DatabaseModels } from './database.models'; 

@Module({
  imports: [
    MongooseModule.forRoot(DatabaseConfig.uri, DatabaseConfig.options), 
    DatabaseModels,
  ],
  exports: [
    DatabaseModels,
  ],
})
export class DatabaseModule {}
