import { Injectable } from '@nestjs/common';
import { RoleGuard } from './role.guard';
import { LogsService } from 'src/modules/logs/logs.service';

@Injectable()
export class StudentGuard extends RoleGuard {
  constructor(logsService: LogsService) {
    super(['student'], true, logsService); 
  }
}
