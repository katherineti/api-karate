import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { PG_CONNECTION } from '../constants';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { karateBeltsTable, eventDivisionsTable, karateCategoriesTable, modalitiesTable } from '../db/schema';
import { and, eq, sql } from 'drizzle-orm';
import { ToggleModalityDto } from './dto/toggle-modality.dto';

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

async getEventCategoriesSummary(eventId: number) {
  // 1. Obtenemos el resumen con contadores basados en la columna 'type'
  const rows = await this.db.select({
    event_id: eventDivisionsTable.event_id, 
    category_id: karateCategoriesTable.id,
    category_name: karateCategoriesTable.category,
    age_range: karateCategoriesTable.age_range,
    allowed_belts_ids: karateCategoriesTable.allowed_belts,
    // Conteo por tipo (asumiendo que agregaste la columna 'type' a modalitiesTable)
    kata_count: sql<number>`count(*) filter (where ${modalitiesTable.type} = 'kata')`.mapWith(Number),
    combate_count: sql<number>`count(*) filter (where ${modalitiesTable.type} = 'combate')`.mapWith(Number),
    total_modalities: sql<number>`count(${eventDivisionsTable.id})`.mapWith(Number),
  })
  .from(eventDivisionsTable)
  .innerJoin(karateCategoriesTable, eq(eventDivisionsTable.category_id, karateCategoriesTable.id))
  .innerJoin(modalitiesTable, eq(eventDivisionsTable.modality_id, modalitiesTable.id))
  .where(eq(eventDivisionsTable.event_id, eventId))
  .groupBy(
    eventDivisionsTable.event_id,
    karateCategoriesTable.id, 
    karateCategoriesTable.category, 
    karateCategoriesTable.age_range,
    // karateCategoriesTable.allowed_belts
  );

  if (rows.length === 0) return [];

  // 2. Traemos todos los cinturones maestros
  const allBelts = await this.db.select().from(karateBeltsTable);

  // 3. Mapeamos para inyectar los objetos de cinturones
  return rows.map(row => {
    const detailedBelts = allBelts
      .filter(belt => row.allowed_belts_ids?.includes(belt.id))
      .map(belt => ({
        id: belt.id,
        name: belt.belt // Asegúrate de que el nombre de la columna sea 'belt' o 'name'
      }));

    return {
      event_id: row.event_id,
      category_id: row.category_id,
      category_name: row.category_name,
      age_range: row.age_range,
      kata_count: row.kata_count,
      combate_count: row.combate_count,
      total_modalities: row.total_modalities,
      allowed_belts: detailedBelts
    };
  });
}

async getCategoriesByEvent(eventId: number) {
  // 1. Obtenemos las divisiones con sus categorías y modalidades
  const rows = await this.db.select({
    id: eventDivisionsTable.id,
    category_id: eventDivisionsTable.category_id,
    category: karateCategoriesTable.category,
    age_range: karateCategoriesTable.age_range,
    allowed_belts_ids: karateCategoriesTable.allowed_belts, // Traemos el array de IDs [1, 2, 3]
    modality: modalitiesTable.name,
    max_score: eventDivisionsTable.max_evaluation_score,
    is_active: eventDivisionsTable.is_active
  })
  .from(eventDivisionsTable)
  .innerJoin(karateCategoriesTable, eq(eventDivisionsTable.category_id, karateCategoriesTable.id))
  .innerJoin(modalitiesTable, eq(eventDivisionsTable.modality_id, modalitiesTable.id))
  .where(eq(eventDivisionsTable.event_id, eventId))
  .orderBy(eventDivisionsTable.id);

  // 2. Si no hay filas, retornamos vacío
  if (rows.length === 0) return [];

  // 3. Obtenemos todos los cinturones maestros para cruzar los nombres
  const allBelts = await this.db.select().from(karateBeltsTable);

  // 4. Mapeamos los resultados para incluir el objeto completo del cinturón
  return rows.map(row => {
    const detailedBelts = allBelts
      .filter(belt => row.allowed_belts_ids?.includes(belt.id))
      .map(belt => ({
        id: belt.id,
        name: belt.belt // o el nombre de la columna que tengas (color, rank, etc)
      }));

    return {
      id: row.id,
      category_id: row.category_id,
      category: row.category,
      age_range: row.age_range,
      modality: row.modality,
      max_score: row.max_score,
      is_active: row.is_active,
      allowed_belts: detailedBelts // Ahora es un array de objetos: [{id: 1, name: 'Blanco'}, ...]
    };
  });
}

async toggleCategoryStatusInEvent(eventId: number, categoryId: number, active: boolean) {
  const result = await this.db
    .update(eventDivisionsTable)
    .set({ 
      is_active: active, 
      updated_at: new Date() 
    } as any) // Usamos 'as any' para evitar el error de inferencia de Drizzle
    .where(
      and(
        eq(eventDivisionsTable.event_id, eventId),
        eq(eventDivisionsTable.category_id, categoryId)
      )
    )
    .returning();

  if (result.length === 0) {
    throw new BadRequestException('No se encontraron divisiones para esa combinación de evento y categoría.');
  }

  return result; // Retorna un array con todas las modalidades actualizadas
}

async toggleModalityConfig(dto: ToggleModalityDto) {
  try {
    const values = {
        event_id: dto.event_id,
        category_id: dto.category_id,
        modality_id: dto.modality_id,
        is_active: dto.is_active,
        max_evaluation_score: 0, // Valor por defecto si es nueva
      }
    const result = await this.db.insert(eventDivisionsTable)
      .values(values)
      .onConflictDoUpdate({
        target: [
          eventDivisionsTable.event_id,
          eventDivisionsTable.category_id,
          eventDivisionsTable.modality_id,
        ],
        set: {
          is_active: dto.is_active,
          updated_at: new Date(),
        } as any,
      })
      .returning();

    return result[0];
  } catch (error) {
    throw new BadRequestException('No se pudo procesar la configuración de la modalidad: ' + error.message);
  }
}

  // Eliminar una configuración del evento
  async removeDivision(divisionId: number) {
    return this.db.delete(eventDivisionsTable)
      .where(eq(eventDivisionsTable.id, divisionId))
      .returning();
  }
}