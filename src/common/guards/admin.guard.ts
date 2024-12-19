import { Injectable } from '@nestjs/common';
import { RoleGuard } from './role.guard';

@Injectable()
export class AdminGuard extends RoleGuard {
  constructor() {
    super(['admin']); 
  }
}