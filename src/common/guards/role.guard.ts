import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Log, LogSchema } from '../../database/schemas/log.schema'; // Ensure correct import
import { LogsService } from '../../modules/logs/logs.service';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly allowedRoles: string[], private readonly allowAdminBypass: boolean = true, private readonly logsService: LogsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      this.logsService.addLog({
        event: 'User is not authenticated',
        status: 401,
        timestamp: new Date(),
        type: 'auth',
      });
      throw new ForbiddenException('User is not authenticated');
    }

    if (this.allowAdminBypass && user.role === 'admin') {
      return true;
    }
    
    if (user.isActive === false) {
      this.logsService.addLog({
        user_id:user.userId,
        event: 'User is deleted',
        status: 403,
        timestamp: new Date(),
        type: 'auth',
      });
      throw new ForbiddenException('User is deleted');
    }

    if (this.allowedRoles.includes(user.role)) {
      return true;
    }
    
    this.logsService.addLog({
      user_id:user.userId,
      event: 'User does not have access' +user.role,
      status: 403,
      timestamp: new Date(),
      type: 'auth',
    });
    throw new ForbiddenException('You do not have access to this resource');
  }
}
