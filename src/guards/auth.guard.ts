// src/auth/auth.guard.ts

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JWTSecret } from '../constants'; // Asegúrate de que esta ruta sea correcta

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    
    if (!token) {
      throw new UnauthorizedException('Token no proporcionado.');
    }

    try {
      // ⚠️ Verifica que el secret aquí coincida con la configuración del JwtModule
      const payload = await this.jwtService.verifyAsync(
        token,
        {
          secret: JWTSecret // Usas tu constante JWTSecret
        }
      );
      
      // 💡 Adjuntamos el payload al objeto request para que el controlador
      // y los RolesGuard puedan acceder a la información del usuario (incluyendo el rol)
      request['user'] = payload; 
    } catch {
      throw new UnauthorizedException('Token inválido o expirado.');
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    // Espera el formato "Bearer <token>"
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}