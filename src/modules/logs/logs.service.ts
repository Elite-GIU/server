import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Log } from 'src/database/schemas/log.schema';

@Injectable()
export class LogsService {
  constructor(@InjectModel(Log.name) private readonly logModel: Model<Log>) {}

  async addLog(logData: Partial<Log>): Promise<Log> {
    const newLog = new this.logModel(logData);
    return newLog.save();
  }

  async getLogs(): Promise<Log[]> {
    return this.logModel.find().sort({ timestamp: -1 }).limit(100).exec();
  }
}
