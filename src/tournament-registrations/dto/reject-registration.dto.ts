import { IsString, IsNotEmpty, MinLength } from 'class-validator';

/**
 * DTO para que un master rechace una inscripción
 * 
 * Usada en: PATCH /tournament-registrations/:id/reject
 * 
 * Flujo:
 * 1. Master ve inscripción en estado 'pendiente' o 'en_espera'
 * 2. Master puede rechazarla con una razón
 * 3. Sistema cambia status a 'rechazado' y registra la razón
 * 4. Alumno puede solicitar nuevamente después
 */
export class RejectRegistrationDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  rejection_reason: string; // Explicación de por qué se rechazó
}
