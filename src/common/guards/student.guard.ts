import { Injectable } from '@nestjs/common';
import { RoleGuard } from './role.guard';

@Injectable()
export class StudentGuard extends RoleGuard {
  constructor() {
    super(['student']); 
  }
}
