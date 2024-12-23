import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Log } from 'src/database/schemas/log.schema';
import { LogsService } from 'src/modules/logs/logs.service';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly allowedRoles: string[], private readonly allowAdminBypass: boolean = true, private readonly logsService: LogsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    this.logsService.addLog(new Log({
      event: 'RoleGuard canActivate called',
      status: 200,
      timestamp: new Date().toISOString(),
      type: 'auth',
      ip: request.ip
    }));

    if (!user) {
      this.logsService.addLog(new Log({
        event: 'User is not authenticated',
        status: 401,
        timestamp: new Date().toISOString(),
        type: 'auth',
        ip: request.ip
      }));
      throw new ForbiddenException('User is not authenticated');
    }

    if (this.allowAdminBypass && user.role === 'admin') {
      this.logsService.addLog(new Log({
        user_id:user._id,
        event: 'Admin bypass allowed',
        status: 200,
        timestamp: new Date().toISOString(),
        type: 'auth',
        ip: request.ip
      }));
      return true;
    }
    
    if (user.isActive === false) {
      this.logsService.addLog(new Log({
        user_id:user._id,
        event: 'User is deleted',
        status: 403,
        timestamp: new Date().toISOString(),
        type: 'auth',
        ip: request.ip
      }));
      throw new ForbiddenException('User is deleted');
    }

    if (this.allowedRoles.includes(user.role)) {
      this.logsService.addLog(new Log({
        user_id:user._id,
        event: 'User role is allowed '+user.role,
        status: 200,
        timestamp: new Date().toISOString(),
        type: 'auth',
        ip: request.ip
      }));
      return true;
    }

    this.logsService.addLog(new Log({
      user_id:user._id,
      event: 'User does not have access' +user.role,
      status: 403,
      timestamp: new Date().toISOString(),
      type: 'auth',
      ip: request.ip
    }));
    throw new ForbiddenException('You do not have access to this resource');
  }
}
