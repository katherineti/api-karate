import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PG_CONNECTION } from '../constants';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { eventCategoriesTable, eventDivisionsTable, participantRequestsTable, tournamentRegistrationsTable } from '../db/schema';
import { and, eq, sql } from 'drizzle-orm';

@Injectable()
export class TournamentRegistrationsService {
  constructor(@Inject(PG_CONNECTION) private readonly db: NeonDatabase) {}

  // tournament-registrations.service.ts

// tournament-registrations.service.ts

async bulkRegisterAthletes(dto: {
  division_id: number;    // ID de la tabla event_divisions
  athlete_ids: number[];  // Arreglo de IDs de alumnos
  master_id: number;      // ID del Master que inscribe
  school_id: number;      // Escuela del Master
}) {
  return await this.db.transaction(async (tx) => {
    
    // 1. OBTENER EL EVENT_ID desde la jerarquía de tablas
    // tournament_registrations -> event_divisions -> event_categories
    const [divisionInfo] = await tx
      .select({
        eventId: eventCategoriesTable.event_id,
      })
      .from(eventDivisionsTable)
      .innerJoin(
        eventCategoriesTable, 
        eq(eventDivisionsTable.event_category_id, eventCategoriesTable.id)
      )
      .where(eq(eventDivisionsTable.id, dto.division_id))
      .limit(1);

    if (!divisionInfo) {
      throw new NotFoundException('La división seleccionada no existe o no está configurada.');
    }

    const targetEventId = divisionInfo.eventId;

    // 2. VALIDAR CUPOS DISPONIBLES
    // Buscamos si el Master tiene una solicitud de cupos extra aprobada para este evento
    const [extraRequest] = await tx
      .select()
      .from(participantRequestsTable)
      .where(and(
        eq(participantRequestsTable.event_id, targetEventId),
        eq(participantRequestsTable.master_id, dto.master_id),
        eq(participantRequestsTable.status, 'approved')
      ))
      .limit(1);

    // Si no tiene solicitud aprobada, podrías definir un cupo base (ej: 10)
    const limitAllowed = extraRequest ? extraRequest.num_participants_requested : 10;

    // 3. CONTAR INSCRIPCIONES ACTUALES
    // Contamos cuántos atletas DIFERENTES de esta escuela ya están en el evento
    const currentInscriptions = await tx
      .select({ 
        totalInscritos: sql<number>`count(distinct ${tournamentRegistrationsTable.athlete_id})` 
      })
      .from(tournamentRegistrationsTable)
      .innerJoin(
        eventDivisionsTable, 
        eq(tournamentRegistrationsTable.division_id, eventDivisionsTable.id)
      )
      .innerJoin(
        eventCategoriesTable, 
        eq(eventDivisionsTable.event_category_id, eventCategoriesTable.id)
      )
      .where(and(
        eq(eventCategoriesTable.event_id, targetEventId),
        // Subconsulta para asegurar que solo contamos atletas de la escuela del Master
        sql`${tournamentRegistrationsTable.athlete_id} IN (
          SELECT id FROM users WHERE school_id = ${dto.school_id}
        )`
      ));

    const inscritosActuales = Number(currentInscriptions[0].totalInscritos);

    // 4. VERIFICAR SI HAY ESPACIO
    // Solo sumamos al conteo si los atletas que estamos intentando inscribir NO estaban ya en otra división
    // Para simplificar, comparamos el total proyectado
    if (inscritosActuales + dto.athlete_ids.length > limitAllowed) {
        throw new BadRequestException(
          `Cupo insuficiente para el evento. Tienes ${inscritosActuales} inscritos de ${limitAllowed} permitidos.`
        );
    }

    // 5. INSERCIÓN MASIVA EN tournament_registrations
    const dataToInsert = dto.athlete_ids.map(athleteId => ({
      athlete_id: athleteId,
      division_id: dto.division_id,
      status: 'confirmado', // O el estado que manejes por defecto
    }));

    try {
      await tx.insert(tournamentRegistrationsTable).values(dataToInsert);
    } catch (error) {
      // Si el error es por la restricción UNIQUE (unique_registration)
      if (error.code === '23505') {
        throw new BadRequestException('Uno o más atletas ya están inscritos en esta misma modalidad y categoría.');
      }
      throw error;
    }

    return {
      success: true,
      message: `${dto.athlete_ids.length} atletas registrados exitosamente en la división.`,
      remainingSlots: limitAllowed - (inscritosActuales + dto.athlete_ids.length)
    };
  });
}

}
