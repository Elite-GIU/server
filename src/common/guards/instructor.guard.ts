import { Injectable } from '@nestjs/common';
import { RoleGuard } from './role.guard';
import { LogsService } from 'src/modules/logs/logs.service';

@Injectable()
export class InstructorGuard extends RoleGuard {
  constructor(logsService: LogsService) {
    super(['instructor'], true, logsService);
  }
}
