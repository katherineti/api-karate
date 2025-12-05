// src/auth/roles.guard.ts (Código corregido)

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'src/decorators/role.decorators';
import { RoleType } from 'types'; // Asegúrate de importar RoleType

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
  
    const requiredRoles = this.reflector.getAllAndOverride<RoleType[] | undefined>(ROLES_KEY, [
      context.getHandler(), 
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // Si no hay roles requeridos, permite el acceso.
    }

    const request = context.switchToHttp().getRequest();
    // 💡 IMPORTANTE: 'user' viene del payload JWT adjuntado por AuthGuard
    const { user } = request; 

    if (!user || !user.role) {
      // El AuthGuard debería haber adjuntado el rol. Si no está, se niega el acceso.
      return false;
    }
    
    // 💡 Corrección Clave: Compara el rol del usuario (user.role) con los roles requeridos.
    // user.role es el string del nombre del rol (ej: 'Admin')
    return requiredRoles.some((requiredRole) => user.role === requiredRole);
  } 
}