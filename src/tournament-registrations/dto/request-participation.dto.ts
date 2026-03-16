import { IsNumber, IsNotEmpty } from 'class-validator';

/**
 * DTO para que un alumno solicite participación en un evento
 * 
 * Usada en: POST /tournament-registrations/request-participation
 * 
 * Flujo:
 * 1. Alumno selecciona Evento → Categoría → Modalidad (division_id)
 * 2. Sistema obtiene automáticamente el event_category_id de la división
 * 3. Se crea registro con status='pendiente', payment_status='no_pagado'
 */
export class RequestParticipationDto {
  @IsNumber()
  @IsNotEmpty()
  division_id: number; // ID de event_divisions (evento + categoría + modalidad)

  @IsNumber()
  @IsNotEmpty()
  event_category_id: number; // ID de event_categories (evento + categoría)
}
