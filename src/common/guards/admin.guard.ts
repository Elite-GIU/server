import { Injectable } from '@nestjs/common';
import { RoleGuard } from './role.guard';
import { LogsService } from 'src/modules/logs/logs.service';

@Injectable()
export class AdminGuard extends RoleGuard {
  constructor(logsService: LogsService) {
    super(['admin'], true, logsService); 
  }
}