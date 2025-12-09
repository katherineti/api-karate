// src/guards/roles.guard.ts

import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'src/decorators/role.decorators';
import { RoleType } from 'types'; 

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
  
    // 1. Obtener los roles requeridos para la ruta (@Roles(...))
    const requiredRoles = this.reflector.getAllAndOverride<RoleType[] | undefined>(ROLES_KEY, [
      context.getHandler(), 
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // Si no hay roles requeridos en el decorador, permite el acceso.
    }

    const request = context.switchToHttp().getRequest();
    
    // 2. Obtener el array de roles del usuario del JWT (adjuntado por AuthGuard)
    const userRoles: string[] = request['user']?.roles; // 💥 CAMBIO CRÍTICO: Leer el array 'roles'

    if (!userRoles || userRoles.length === 0) {
      // El usuario está autenticado, pero no tiene roles asignados.
      throw new ForbiddenException('Acceso denegado. El usuario no tiene roles de autorización.'); 
    }
    
    // 3. Lógica de Autorización: Verificar si existe una superposición.
    // Retorna true si AL MENOS UNO de los roles requeridos coincide 
    // con AL MENOS UNO de los roles del usuario.
    return requiredRoles.some((requiredRole) => 
      userRoles.includes(requiredRole as string)
    );
  }
}