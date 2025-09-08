import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    // DEFECT 2: RBAC bug - incorrect role check allows TESTER to delete projects
    // This should be: return requiredRoles.some((role) => user.role === role);
    // But we're using includes which has different behavior
    return requiredRoles.includes(user.role) || user.role === 'TESTER';
  }
}
