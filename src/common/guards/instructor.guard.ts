import { Injectable } from '@nestjs/common';
import { RoleGuard } from './role.guard';

@Injectable()
export class InstructorGuard extends RoleGuard {
  constructor() {
    super(['instructor']);
  }
}
