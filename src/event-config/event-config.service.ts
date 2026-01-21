import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { PG_CONNECTION } from '../constants';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { eventDivisionsTable, karateCategoriesTable, modalitiesTable } from '../db/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class EventConfigService {
constructor(@Inject(PG_CONNECTION) private readonly db: NeonDatabase) {}

  // Configura una categoría/modalidad para un evento (Upsert)
async setupDivision(dto: any) { // Usa tu DTO CreateEventConfigDto aquí
    try {
      const values = {
        event_id: dto.event_id,
        category_id: dto.category_id,
        modality_id: dto.modality_id,
        max_evaluation_score: dto.max_evaluation_score ?? 0,
        is_active: dto.is_active ?? true,
      }
      const result = await this.db.insert(eventDivisionsTable)
        .values(values)
        .onConflictDoUpdate({
          target: [
            eventDivisionsTable.event_id, 
            eventDivisionsTable.category_id, 
            eventDivisionsTable.modality_id
          ],
          set: { 
            max_evaluation_score: dto.max_evaluation_score ?? 0,
            is_active: dto.is_active ?? true,
            updated_at: new Date()
          } as any,
        })
        .returning();

      return result[0];
    } catch (error) {
      throw new BadRequestException('Error al configurar la división: ' + error.message);
    }
  }

  async getCategoriesByEvent(eventId: number) {
    return this.db.select({
      id: eventDivisionsTable.id,
      category: karateCategoriesTable.category,
      age_range: karateCategoriesTable.age_range,
      modality: modalitiesTable.name,
      max_score: eventDivisionsTable.max_evaluation_score,
      is_active: eventDivisionsTable.is_active
    })
    .from(eventDivisionsTable)
    .innerJoin(karateCategoriesTable, eq(eventDivisionsTable.category_id, karateCategoriesTable.id))
    .innerJoin(modalitiesTable, eq(eventDivisionsTable.modality_id, modalitiesTable.id))
    .where(eq(eventDivisionsTable.event_id, eventId));
  }

  // Eliminar una configuración del evento
  async removeDivision(divisionId: number) {
    return this.db.delete(eventDivisionsTable)
      .where(eq(eventDivisionsTable.id, divisionId))
      .returning();
  }
}