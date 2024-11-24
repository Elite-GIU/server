import { Injectable } from '@nestjs/common';
import { RoleGuard } from './role.guard';

@Injectable()
export class AuthenticatedGuard extends RoleGuard {
  constructor() {
    super([]);
  }
}
