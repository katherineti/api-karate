import { IsNumber, IsNotEmpty } from 'class-validator';

/**
 * DTO para que el Master formalice la inscripción y elija categoría y modalidad
 * 
 * Usada en: PATCH /tournament-registrations/:id/complete
 * 
 * Flujo:
 * 1. Master revisa la solicitud del alumno
 * 2. Master elige: Categoría (event_category_id) y Modalidad (division_id)
 * 3. Sistema actualiza la inscripción con estos datos
 * 4. Inscripción lista para validación de pago
 */
export class UsersParamsDto {
  @IsNumber()
  @IsNotEmpty()
  event_id: number;

  @IsNumber()
  @IsNotEmpty()
  category_id: number; // ID de karateCategoriesTable (la categoría en la que participa)

  @IsNumber()
  @IsNotEmpty()
  modality_id: number; // ID de modalitiesTable (la modalidad: Kata, Kumite, etc.)
}
