import { Type } from 'class-transformer';
import { IsNumber, IsNotEmpty } from 'class-validator';

/**
 * DTO para que un alumno solicite participación en un evento
 * 
 * Usada en: POST /tournament-registrations/request-participation
 * 
 * Flujo:
 * 1. Alumno selecciona SOLO el Evento (no categoría ni modalidad)
 * 2. Sistema crea registro con status='pendiente' y division_id=NULL
 * 3. Master verá la solicitud y elegirá la categoría y modalidad después
 */
export class RequestParticipationDto {
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  event_id: number; // ID del evento al que quiere participar (es TODO lo que necesita)

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  category_id: number; // ID de karateCategoriesTable (la categoría en la que participa)

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  modality_id: number;
}
