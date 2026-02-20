import { SetMetadata } from '@nestjs/common';
export const ROLES_KEY = 'roles';
export const Roles = (...roles: Array<'ADMIN'|'OFFICER'|'VIEWER'>) =>
  SetMetadata(ROLES_KEY, roles);