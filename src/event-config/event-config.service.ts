import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { PG_CONNECTION } from '../constants';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { karateBeltsTable, eventDivisionsTable, karateCategoriesTable, modalitiesTable, divisionJudgesTable, usersTable, eventCategoriesTable } from '../db/schema';
import { and, eq, inArray, sql } from 'drizzle-orm';
import { ToggleModalityDto } from './dto/toggle-modality.dto';
import * as schema from '../db/schema'; // Importa todo el esquema

@Injectable()
export class EventConfigService {
constructor(@Inject(PG_CONNECTION) private readonly db: NeonDatabase<typeof schema>) {}

  // Configura una categoría/modalidad para un evento (Upsert)
/* async setupDivision(dto: any) {
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
  } */

//v2 setupDivision: modificada por eventCategoriesTable
async setupDivision(dto: any) {
  try {
    // 1. "Upsert" inteligente: Inserta o actualiza un campo con su mismo valor para asegurar que RETURNING nos dé el ID
    const [eventCategory] = await this.db.insert(eventCategoriesTable)
      .values({
        event_id: dto.event_id,
        category_id: dto.category_id,
        is_active: true,
      } as any)
      .onConflictDoUpdate({
        target: [eventCategoriesTable.event_id, eventCategoriesTable.category_id],
        set: { event_id: dto.event_id } // "Dummy update" para forzar el retorno del ID existente
      })
      .returning({ id: eventCategoriesTable.id });

    // 2. Ahora ya tienes el ID sin haber hecho un SELECT extra
    const result = await this.db.insert(eventDivisionsTable)
      .values({
        event_category_id: eventCategory.id,
        modality_id: dto.modality_id,
        max_evaluation_score: dto.max_evaluation_score ?? 0,
        is_active: dto.is_active ?? true,
      } as any)
      .onConflictDoUpdate({
        target: [
          eventDivisionsTable.event_category_id, 
          eventDivisionsTable.modality_id
        ],
        set: { 
          max_evaluation_score: dto.max_evaluation_score ?? 0,
          is_active: dto.is_active ?? true,
        } as any,
      })
      .returning();

    return {
      ...result[0],
      event_id: dto.event_id,
      category_id: dto.category_id
    };

  } catch (error) {
    throw new BadRequestException('Error al configurar la división: ' + error.message);
  }
}

  // v1
/* async getEventCategoriesSummary(eventId: number) {
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
  .where(eq(eventDivisionsTable.event_id, eventId)
)
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
} */

//v2
/* async getEventCategoriesSummary(eventId: number) {
  // 1. Obtenemos el resumen con contadores filtrando por 'is_active'
  const rows = await this.db.select({
    event_id: eventDivisionsTable.event_id, 
    category_id: karateCategoriesTable.id,
    category_name: karateCategoriesTable.category,
    age_range: karateCategoriesTable.age_range,
    allowed_belts_ids: karateCategoriesTable.allowed_belts,
    category_is_active: eventDivisionsTable.category_is_active,
  
    // Conteo de Katas: Solo filtra por el is_active de la modalidad
    kata_count: sql<number>`count(*) filter (
      where ${modalitiesTable.type} = 'kata' 
      AND ${eventDivisionsTable.is_active} = true
    )`.mapWith(Number),

  /* // Conteo de Katas: solo si modalidad es 'kata' Y está activa Y la categoría está activa
    kata_count: sql<number>`count(*) filter (
      where ${modalitiesTable.type} = 'kata' 
      AND ${eventDivisionsTable.is_active} = true 
      AND ${eventDivisionsTable.category_is_active} = true
    )`.mapWith(Number), * /

    // Conteo de Combates: Solo filtra por el is_active de la modalidad
    combate_count: sql<number>`count(*) filter (
      where ${modalitiesTable.type} = 'combate' 
      AND ${eventDivisionsTable.is_active} = true
    )`.mapWith(Number),
    // Total de modalidades activas independientemente del status de la categoría
    total_modalities: sql<number>`count(*) filter (
     where ${eventDivisionsTable.is_active} = true
    )`.mapWith(Number),
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
    karateCategoriesTable.allowed_belts,
    eventDivisionsTable.category_is_active // Obligatorio para el GroupBy
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
        name: belt.belt 
      }));

    return {
      event_id: row.event_id,
      category_id: row.category_id,
      category_name: row.category_name,
      // Status global de la categoría para la UI
      category_is_active: row.category_is_active,
      age_range: row.age_range,
      kata_count: row.kata_count,
      combate_count: row.combate_count,
      total_modalities: row.total_modalities,
      allowed_belts: detailedBelts
    };
  });
} */

  //v3 modificada por eventCategoriesTable
async getEventCategoriesSummary(eventId: number) {
  // 1. Consultamos partiendo de eventCategoriesTable (La nueva tabla relacional)
  const rows = await this.db.select({
    event_id: eventCategoriesTable.event_id,
    category_id: karateCategoriesTable.id,
    category_name: karateCategoriesTable.category,
    age_range: karateCategoriesTable.age_range,
    allowed_belts_ids: karateCategoriesTable.allowed_belts,
    // El status ahora viene de la tabla de unión directa
    category_is_active: eventCategoriesTable.is_active,

    // Conteo de Katas: Miramos en la tabla divisions (unida por event_category_id)
    kata_count: sql<number>`count(${eventDivisionsTable.id}) filter (
      where ${modalitiesTable.type} = 'kata' 
      AND ${eventDivisionsTable.is_active} = true
    )`.mapWith(Number),

    // Conteo de Combates
    combate_count: sql<number>`count(${eventDivisionsTable.id}) filter (
      where ${modalitiesTable.type} = 'combate' 
      AND ${eventDivisionsTable.is_active} = true
    )`.mapWith(Number),

    // Total de modalidades activas
    total_modalities: sql<number>`count(${eventDivisionsTable.id}) filter (
      where ${eventDivisionsTable.is_active} = true
    )`.mapWith(Number),
  })
  .from(eventCategoriesTable) // <--- Cambio clave: empezamos desde la relación categoría-evento
  .innerJoin(
    karateCategoriesTable, 
    eq(eventCategoriesTable.category_id, karateCategoriesTable.id)
  )
  // LEFT JOIN con divisions para que la categoría aparezca aunque no tenga modalidades registradas
  .leftJoin(
    eventDivisionsTable, 
    eq(eventDivisionsTable.event_category_id, eventCategoriesTable.id)
  )
  .leftJoin(
    modalitiesTable, 
    eq(eventDivisionsTable.modality_id, modalitiesTable.id)
  )
  .where(eq(eventCategoriesTable.event_id, eventId))
  .groupBy(
    eventCategoriesTable.id, // Agrupamos por el ID de la relación para evitar duplicados
    eventCategoriesTable.event_id,
    eventCategoriesTable.is_active,
    karateCategoriesTable.id, 
    karateCategoriesTable.category, 
    karateCategoriesTable.age_range,
    karateCategoriesTable.allowed_belts
  );

  if (rows.length === 0) return [];

  // 2. Traemos todos los cinturones maestros (Igual que antes)
  const allBelts = await this.db.select().from(karateBeltsTable);

  // 3. Mapeamos para inyectar los objetos de cinturones (Mantiene la estructura original)
  return rows.map(row => {
    const detailedBelts = allBelts
      .filter(belt => row.allowed_belts_ids?.includes(belt.id))
      .map(belt => ({
        id: belt.id,
        name: belt.belt 
      }));

    return {
      event_id: row.event_id,
      category_id: row.category_id,
      category_name: row.category_name,
      category_is_active: row.category_is_active,
      age_range: row.age_range,
      kata_count: row.kata_count,
      combate_count: row.combate_count,
      total_modalities: row.total_modalities,
      allowed_belts: detailedBelts
    };
  });
}

async getCategoriesByEvent(eventId: number) { //sin usar
  // 1. Obtenemos las divisiones haciendo el puente por eventCategoriesTable
  const rows = await this.db.select({
    id: eventDivisionsTable.id,
    // Obtenemos el category_id desde la tabla intermedia
    category_id: eventCategoriesTable.category_id, 
    category: karateCategoriesTable.category,
    age_range: karateCategoriesTable.age_range,
    allowed_belts_ids: karateCategoriesTable.allowed_belts,
    modality: modalitiesTable.name,
    max_score: eventDivisionsTable.max_evaluation_score,
    is_active: eventDivisionsTable.is_active
  })
  .from(eventDivisionsTable)
  // JOIN 1: Conectar la división con la relación Evento-Categoría
  .innerJoin(
    eventCategoriesTable, 
    eq(eventDivisionsTable.event_category_id, eventCategoriesTable.id)
  )
  // JOIN 2: Conectar con la definición de la categoría
  .innerJoin(
    karateCategoriesTable, 
    eq(eventCategoriesTable.category_id, karateCategoriesTable.id)
  )
  // JOIN 3: Conectar con la modalidad (Kata/Kumite)
  .innerJoin(
    modalitiesTable, 
    eq(eventDivisionsTable.modality_id, modalitiesTable.id)
  )
  // Filtramos por el ID del evento en la tabla intermedia
  .where(eq(eventCategoriesTable.event_id, eventId))
  .orderBy(eventDivisionsTable.id);

  // 2. Si no hay filas, retornamos vacío
  if (rows.length === 0) return [];

  // 3. Obtenemos los cinturones maestros
  const allBelts = await this.db.select().from(karateBeltsTable);

  // 4. Mapeamos los resultados manteniendo la estructura original
  return rows.map(row => {
    const detailedBelts = allBelts
      .filter(belt => row.allowed_belts_ids?.includes(belt.id))
      .map(belt => ({
        id: belt.id,
        name: belt.belt 
      }));

    return {
      id: row.id,
      category_id: row.category_id,
      category: row.category,
      age_range: row.age_range,
      modality: row.modality,
      max_score: row.max_score,
      is_active: row.is_active,
      allowed_belts: detailedBelts 
    };
  });
}

async toggleCategoryStatusInEvent(eventId: number, categoryId: number, active: boolean) {

try{  // 1. Creamos una subconsulta para encontrar el ID de la relación evento-categoría
/*   const eventCategorySubquery = this.db
    .select({ id: eventCategoriesTable.id })
    .from(eventCategoriesTable)
    .where(
      and(
        eq(eventCategoriesTable.event_id, eventId),
        eq(eventCategoriesTable.category_id, categoryId)
      )
    );

  // 2. Actualizamos event_divisions basándonos en ese ID
  const result = await this.db
    .update(eventDivisionsTable)
    .set({ 
      is_active: active, 
      updated_at: new Date() 
    } as any)
    .where(
      inArray(
        eventDivisionsTable.event_category_id, 
        eventCategorySubquery
      )
    )
    .returning(); */

  // if (result.length === 0) {
  //   throw new BadRequestException('No se encontraron modalidades configuradas para esa categoría en este evento.');
  // }

  // 3. Opcional: También actualizamos el estado de la categoría en la tabla intermedia
  // para que haya coherencia total en el sistema
   await this.db.update(eventCategoriesTable)
    .set({ is_active: active } as any)
    .where(
      and(
        eq(eventCategoriesTable.event_id, eventId),
        eq(eventCategoriesTable.category_id, categoryId)
      )
    );

  // Retorna el array de modalidades (Kata, Kumite, etc.) con el nuevo estado
  // return result; 
    return {
      event_id: eventId,
      category_id: categoryId,
      is_active: active,
    }; 
  }catch (error) {
    console.error('Error en toggleCategoryStatusInEvent:', error);
    throw new BadRequestException('Error al actualizar el estado de la categoría, en el evento ' + eventId + ' para la categoría ' + categoryId + ': ' + error.message);
  }
}

//toggleModalityConfig v1: si funciona, pero no se guardan los jueces
/* async toggleModalityConfig(dto: ToggleModalityDto) {
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
} */

//toggleModalityConfig v2
/* async toggleModalityConfig(dto: ToggleModalityDto) {
  try {
    return await this.db.transaction(async (tx) => {
      // 1. Upsert de la Modalidad
      const [division] = await tx.insert(eventDivisionsTable)
        .values({
          event_id: dto.event_id,
          category_id: dto.category_id,
          modality_id: dto.modality_id,
          is_active: dto.is_active,
        } as any)
        .onConflictDoUpdate({
          target: [
            eventDivisionsTable.event_id,
            eventDivisionsTable.category_id,
            eventDivisionsTable.modality_id,
          ],
          set: { is_active: dto.is_active, updated_at: new Date() } as any,
        })
        .returning();

      // 2. Upsert de los Jueces (Sincronización de estados)
      if (dto.judges && dto.judges.length > 0) {
        for (const judge of dto.judges) {
          await tx.insert(divisionJudgesTable)
            .values({
              division_id: division.id,
              judge_id: judge.judge_id,
              is_active: judge.is_active,
              role_in_pool: 'juez',
            })
            .onConflictDoUpdate({
              target: [divisionJudgesTable.division_id, divisionJudgesTable.judge_id],
              set: { 
                is_active: judge.is_active, 
                updated_at: new Date() 
              } as any,
            });
        }
      }

      // 3. Respuesta con los datos actuales
      return {
        ...division,
        judges_updated: dto.judges?.length || 0
      };
    });
  } catch (error) {
    throw new BadRequestException('Error al sincronizar modalidad y jueces: ' + error.message);
  }
} */

//toggleModalityConfig v3
async toggleModalityConfig(dto: ToggleModalityDto) {
  try {
    return await this.db.transaction(async (tx) => {
      
      // 1. Obtener o crear la relación entre Evento y Categoría (event_categories)
      // Esto es necesario porque event_divisions ahora depende de event_category_id
      const [eventCategory] = await tx.insert(eventCategoriesTable)
        .values({
          event_id: dto.event_id,
          category_id: dto.category_id,
          is_active: true, // Por defecto activo si estamos configurando una modalidad
        } as any)
        .onConflictDoUpdate({
          target: [eventCategoriesTable.event_id, eventCategoriesTable.category_id],
          set: { updated_at: new Date() } as any, // Solo actualizamos el timestamp si ya existe
        })
        .returning();

      // 2. Upsert de la Modalidad (event_divisions)
      // Ahora usamos event_category_id en lugar de event_id y category_id
      const [division] = await tx.insert(eventDivisionsTable)
        .values({
          event_category_id: eventCategory.id, // Nueva columna
          modality_id: dto.modality_id,
          is_active: dto.is_active,
        } as any)
        .onConflictDoUpdate({
          target: [
            eventDivisionsTable.event_category_id,
            eventDivisionsTable.modality_id,
          ],
          set: { 
            is_active: dto.is_active, 
            updated_at: new Date() 
          } as any,
        })
        .returning();

      // 3. Upsert de los Jueces
      if (dto.judges && dto.judges.length > 0) {
        for (const judge of dto.judges) {
          await tx.insert(divisionJudgesTable)
            .values({
              division_id: division.id,
              judge_id: judge.judge_id,
              is_active: judge.is_active,
              role_in_pool: 'juez',
            })
            .onConflictDoUpdate({
              target: [divisionJudgesTable.division_id, divisionJudgesTable.judge_id],
              set: { 
                is_active: judge.is_active, 
                updated_at: new Date() 
              },
            });
        }
      }

      // 4. Respuesta manteniendo la estructura original
      // Reconstruimos los IDs originales para que el frontend no rompa
      return {
        id: division.id,
        event_id: dto.event_id,       // Mantenemos consistencia con el DTO
        category_id: dto.category_id, // Mantenemos consistencia con el DTO
        event_category_id: eventCategory.id,
        modality_id: division.modality_id,
        is_active: division.is_active,
        judges_updated: dto.judges?.length || 0
      };
    });
  } catch (error) {
    console.error('Error en toggleModalityConfig:', error);
    throw new BadRequestException('Error al sincronizar modalidad y jueces: ' + error.message);
  }
}

// v1
/* async getModalitiesByEventCategory(eventId: number, categoryId: number) {
  return this.db.select({
    id: modalitiesTable.id,
    name: modalitiesTable.name,
    type: modalitiesTable.type, // Asegúrate de que esta columna exista en tu DB
    is_active: eventDivisionsTable.is_active,
    // max_score: eventDivisionsTable.max_evaluation_score
  })
  .from(eventDivisionsTable)
  .innerJoin(modalitiesTable, eq(eventDivisionsTable.modality_id, modalitiesTable.id))
  .where(
    and(
      eq(eventDivisionsTable.event_id, eventId),
      eq(eventDivisionsTable.category_id, categoryId)
    )
  );
} */

  //v2
/*   async getModalitiesByEventCategory(eventId: number, categoryId: number) {//Muestra las modalidades de la division evento+categoria
  // 1. Obtenemos las modalidades base de esta división (evento + categoría)
  const divisions = await this.db.select({
    division_id: eventDivisionsTable.id,
    modality_id: modalitiesTable.id, // ID de la modalidad
    modality_name: modalitiesTable.name,
    modality_type: modalitiesTable.type,
    is_active: eventDivisionsTable.is_active,
  })
  .from(eventDivisionsTable)
  .innerJoin(modalitiesTable, eq(eventDivisionsTable.modality_id, modalitiesTable.id))
  .where(
    and(
      eq(eventDivisionsTable.event_id, eventId),
      eq(eventDivisionsTable.category_id, categoryId)
    )
  );

  if (divisions.length === 0) return [];

  // 2. Extraemos los IDs de las divisiones para buscar sus jueces
  const divisionIds = divisions.map(d => d.division_id);

  // 3. Buscamos los jueces asignados a estas divisiones
  const allJudges = await this.db.select({
    division_id: divisionJudgesTable.division_id,
    judge_id: usersTable.id,
    judge_name: usersTable.name,
    judge_lastname: usersTable.lastname,
    judge_email: usersTable.email,
    role: divisionJudgesTable.role_in_pool
  })
  .from(divisionJudgesTable)
  .innerJoin(usersTable, eq(divisionJudgesTable.judge_id, usersTable.id))
  .where(inArray(divisionJudgesTable.division_id, divisionIds));

  // 4. Combinamos los datos: asignamos a cada modalidad su lista de jueces
  return divisions.map(division => ({
    ...division,
    assigned_judges: allJudges
      .filter(j => j.division_id === division.division_id)
      .map(j => ({
        id: j.judge_id,
        name: j.judge_name,
        lastname: j.judge_lastname,
        email: j.judge_email,
        role: j.role //aun no se usa
      }))
  }));
} */

//v3
/* async getModalitiesByEventCategory(eventId: number, categoryId: number) {
  // 1. Obtener las modalidades de la división
  const divisions = await this.db.select({
    division_id: eventDivisionsTable.id,
    modality_id: modalitiesTable.id,
    modality_name: modalitiesTable.name,
    modality_type: modalitiesTable.type,
    is_active: eventDivisionsTable.is_active,
  })
  .from(eventDivisionsTable)
  .innerJoin(modalitiesTable, eq(eventDivisionsTable.modality_id, modalitiesTable.id))
  .where(
    and(
      eq(eventDivisionsTable.event_id, eventId),
      eq(eventDivisionsTable.category_id, categoryId)
    )
  );

  if (divisions.length === 0) return [];

  const divisionIds = divisions.map(d => d.division_id);

  // 2. Obtener los jueces vinculados a esas divisiones
  const allJudges = await this.db.select({
    division_id: divisionJudgesTable.division_id,
    judge_id: usersTable.id,
    judge_name: usersTable.name,
    judge_lastname: usersTable.lastname,
    judge_email: usersTable.email,
    role: divisionJudgesTable.role_in_pool,
    judge_status: divisionJudgesTable.is_active // Estado en la tabla intermedia
  })
  .from(divisionJudgesTable)
  .innerJoin(usersTable, eq(divisionJudgesTable.judge_id, usersTable.id))
  .where(inArray(divisionJudgesTable.division_id, divisionIds));

  // 3. Mapear y FILTRAR solo los jueces activos
  return divisions.map(division => ({
    ...division,
    assigned_judges: allJudges
      .filter(j => 
        j.division_id === division.division_id && 
        j.judge_status === true // <--- Filtro de jueces activos
      )
      .map(j => ({
        id: j.judge_id,
        name: j.judge_name,
        lastname: j.judge_lastname,
        email: j.judge_email,
        role: j.role,
        is_active: j.judge_status // Mostramos su estatus (siempre será true por el filtro)
      }))
  }));
} */

//v4 modificada por eventCategoriesTable
async getModalitiesByEventCategory(eventId: number, categoryId: number) {
  // 1. Obtener las modalidades de la división pasando por eventCategoriesTable
  const divisions = await this.db.select({
    division_id: eventDivisionsTable.id,
    modality_id: modalitiesTable.id,
    modality_name: modalitiesTable.name,
    modality_type: modalitiesTable.type,
    is_active: eventDivisionsTable.is_active,
  })
  .from(eventDivisionsTable)
  .innerJoin(
    eventCategoriesTable, 
    eq(eventDivisionsTable.event_category_id, eventCategoriesTable.id)
  )
  .innerJoin(
    modalitiesTable, 
    eq(eventDivisionsTable.modality_id, modalitiesTable.id)
  )
  .where(
    and(
      eq(eventCategoriesTable.event_id, eventId),
      eq(eventCategoriesTable.category_id, categoryId)
    )
  );

  if (divisions.length === 0) return [];

  const divisionIds = divisions.map(d => d.division_id);

  // 2. Obtener los jueces vinculados a esas divisiones (Esta lógica se mantiene igual)
  const allJudges = await this.db.select({
    division_id: divisionJudgesTable.division_id,
    judge_id: usersTable.id,
    judge_name: usersTable.name,
    judge_lastname: usersTable.lastname,
    judge_email: usersTable.email,
    role: divisionJudgesTable.role_in_pool,
    judge_status: divisionJudgesTable.is_active 
  })
  .from(divisionJudgesTable)
  .innerJoin(usersTable, eq(divisionJudgesTable.judge_id, usersTable.id))
  .where(inArray(divisionJudgesTable.division_id, divisionIds));

  // 3. Mapear y filtrar jueces (Mantenemos la estructura de respuesta original)
  return divisions.map(division => ({
    ...division,
    assigned_judges: allJudges
      .filter(j => 
        j.division_id === division.division_id && 
        j.judge_status === true 
      )
      .map(j => ({
        id: j.judge_id,
        name: j.judge_name,
        lastname: j.judge_lastname,
        email: j.judge_email,
        role: j.role,
        is_active: j.judge_status 
      }))
  }));
}

  // Eliminar una configuración del evento
  async removeDivision(divisionId: number) {
    return this.db.delete(eventDivisionsTable)
      .where(eq(eventDivisionsTable.id, divisionId))
      .returning();
  }

 //Registrar Categoría a un evento (Sin modalidades)
// event-config.service.ts

async registerCategoryInEvent(eventId: number, categoryId: number, isActive: boolean = true) { // <--- Agrega isActive aquí
  try {
    const [result] = await this.db.insert(eventCategoriesTable)
      .values({
        event_id: eventId,
        category_id: categoryId,
        is_active: isActive,
      } as any)
      .onConflictDoUpdate({
        target: [eventCategoriesTable.event_id, eventCategoriesTable.category_id],
        set: { 
          is_active: isActive, 
          updated_at: new Date() 
        } as any,
      })
      .returning();

    return result;
  } catch (error) {
    throw new BadRequestException(`Error al registrar categoría: ${error.message}`);
  }
}
}