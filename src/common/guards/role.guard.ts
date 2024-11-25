import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly allowedRoles: string[], private readonly allowAdminBypass: boolean = true) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User is not authenticated');
    }

    if (this.allowAdminBypass && user.role === 'admin') {
      console.log('Admin bypass');
      return true;
    }

    if (this.allowedRoles.includes(user.role)) {
      console.log(`Access granted for role: ${user.role}`);
      return true;
    }

    console.log(`Access denied for role: ${user.role}`);
    throw new ForbiddenException('You do not have access to this resource');
  }
}
