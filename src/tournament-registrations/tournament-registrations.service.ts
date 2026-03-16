import { BadRequestException, Inject, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { PG_CONNECTION, ROL_ALUMNO } from '../constants';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { eventCategoriesTable, eventDivisionsTable, participantRequestsTable, schoolTable, tournamentRegistrationsTable, usersTable, eventsTable, modalitiesTable, karateCategoriesTable } from '../db/schema';
import { and, eq, sql, isNull, ne } from 'drizzle-orm';

@Injectable()
export class TournamentRegistrationsService {
    private readonly logger = new Logger(TournamentRegistrationsService.name);
  
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

/*
Pagina : Puntuación de Atleta - Campo select: '2. Selecciona el Atleta'
Obtener los atletas(usuarios con rol alumno - id rol 5) que estan inscritos en una division seleccionada(division: evento + categoria+modalidad) y que ademas pertenecen a una escuela seleccionada
*/
async getAthletesByDivisionAndSchool(divisionId: number, schoolId: number) {
  try {
    const athletes = await this.db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        lastname: usersTable.lastname,
        email: usersTable.email,
        status: usersTable.status,
        // Traemos el estado de la inscripción también
        registrationStatus: tournamentRegistrationsTable.status, 
      })
      .from(usersTable)
      .innerJoin(
        tournamentRegistrationsTable,
        eq(usersTable.id, tournamentRegistrationsTable.athlete_id)
      )
      .where(
        and(
          // 1. Que pertenezcan a la división seleccionada
          eq(tournamentRegistrationsTable.division_id, divisionId),
          // 2. Que pertenezcan a la escuela seleccionada
          eq(usersTable.school_id, schoolId),
          // 3. Que tengan el rol de alumno (ID 5)
          // Usamos @> porque roles_ids es un jsonb array en tu schema
          sql`${usersTable.roles_ids} @> ${JSON.stringify([ROL_ALUMNO])}::jsonb`
        )
      );

    return athletes;
  } catch (error) {
    this.logger.error('Error al obtener atletas inscritos:', error);
    throw new InternalServerErrorException('No se pudieron obtener los atletas inscritos.');
  }
}

/*
Pagina : Puntuación de Atleta - Campo select: '1. Selecciona la escuela'
lista las escuelas de los atletas que están inscritos en la division seleccionada
*/
async getSchoolsByDivision(divisionId: number) {
  try {
    const result = await this.db
      .select({
        schoolId: schoolTable.id,
        schoolName: schoolTable.name,
        schoolLogo: schoolTable.logo_url,
        // Agregamos un conteo de cuántos atletas hay de esa escuela en esta división
        athleteCount: sql<number>`count(${usersTable.id})`
      })
      .from(tournamentRegistrationsTable)
      // 1. Unimos con usuarios para saber quién es el atleta
      .innerJoin(
        usersTable, 
        eq(tournamentRegistrationsTable.athlete_id, usersTable.id)
      )
      // 2. Unimos con escuelas a través del school_id del usuario
      .innerJoin(
        schoolTable, 
        eq(usersTable.school_id, schoolTable.id)
      )
      .where(eq(tournamentRegistrationsTable.division_id, divisionId))
      // Agrupamos por escuela para no repetir el nombre de la escuela por cada alumno
      .groupBy(schoolTable.id, schoolTable.name, schoolTable.logo_url);

    return result;
  } catch (error) {
    this.logger.error('Error al obtener escuelas de la división:', error);
    throw new InternalServerErrorException('Error al procesar la lista de escuelas.');
  }
}

  /**
   * MÉTODO 1: Crear solicitud de participación (Alumno)
   * 
   * Flujo:
   * - Alumno SOLO solicita participación en un evento (sin elegir categoría/modalidad)
   * - Se crea registro con status='pendiente', division_id=NULL, event_category_id=NULL
   * - Master decidirá la categoría y modalidad después
   * - Alumno luego paga y Master formaliza
   */
  async createParticipationRequest(athleteId: number, eventId: number) {
    try {
      // 1. Validar que el evento existe y está activo
      const [event] = await this.db
        .select()
        .from(eventsTable)
        .where(eq(eventsTable.id, eventId))
        .limit(1);

      if (!event) {
        throw new NotFoundException('El evento seleccionado no existe.');
      }

      // 2. Validar que el atleta no tiene ya una solicitud para este evento
      const [existingReg] = await this.db
        .select()
        .from(tournamentRegistrationsTable)
        .where(and(
          eq(tournamentRegistrationsTable.athlete_id, athleteId),
          eq(tournamentRegistrationsTable.event_id, eventId)
        ))
        .limit(1);

      if (existingReg) {
        throw new BadRequestException('Ya tienes una solicitud de participación para este evento.');
      }

      // 3. Crear la solicitud (sin división ni categoría, las asigna Master después)
      const [newRegistration] = await this.db
        .insert(tournamentRegistrationsTable)
        .values({
          athlete_id: athleteId,
          event_id: eventId,
          division_id: null, // El Master lo asignará después
          event_category_id: null, // El Master lo asignará después
          status: 'pendiente',
          payment_status: 'no_pagado',
          registration_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning();

      return {
        success: true,
        message: 'Solicitud de participación creada. Espera a que el Master revise tu solicitud.',
        data: newRegistration,
      };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error en createParticipationRequest:', error);
      throw new InternalServerErrorException('Error al crear la solicitud de participación.');
    }
  }

  /**
   * MÉTODO 1B: Formalizar inscripción (Master)
   * 
   * Flujo:
   * - Master revisa la solicitud del alumno
   * - Master elige la categoría y modalidad en la que participará
   * - Se actualiza la inscripción con estos datos
   * - Status pasa a "pendiente_pago" (esperando que alumno pague)
   */
  async completeRegistrationByMaster(
    registrationId: number,
    masterId: number,
    categoryId: number,
    modalityId: number
  ) {
    try {
      // 1. Obtener la inscripción
      const [registration] = await this.db
        .select()
        .from(tournamentRegistrationsTable)
        .where(eq(tournamentRegistrationsTable.id, registrationId))
        .limit(1);

      if (!registration) {
        throw new NotFoundException('Inscripción no encontrada.');
      }

      // 2. Validar que el status es 'pendiente' (no ha sido completada ni rechazada)
      if (registration.status !== 'pendiente') {
        throw new BadRequestException(
          `No puedes completar una inscripción en estado "${registration.status}".`
        );
      }

      // 3. Validar que el master es el creador del evento
      const [event] = await this.db
        .select()
        .from(eventsTable)
        .where(and(
          eq(eventsTable.id, registration.event_id),
          eq(eventsTable.created_by, masterId)
        ))
        .limit(1);

      if (!event) {
        throw new NotFoundException('No tienes permiso para completar inscripciones de este evento.');
      }

      // 4. Validar que la categoría existe
      const [category] = await this.db
        .select()
        .from(karateCategoriesTable)
        .where(eq(karateCategoriesTable.id, categoryId))
        .limit(1);

      if (!category) {
        throw new NotFoundException('La categoría seleccionada no existe.');
      }

      // 5. Validar que la modalidad existe
      const [modality] = await this.db
        .select()
        .from(modalitiesTable)
        .where(eq(modalitiesTable.id, modalityId))
        .limit(1);

      if (!modality) {
        throw new NotFoundException('La modalidad seleccionada no existe.');
      }

      // 6. Actualizar con la categoría y modalidad elegidas por el Master
      const [updated] = await this.db
        .update(tournamentRegistrationsTable)
        .set({
          category_id: categoryId,
          modality_id: modalityId,
          master_validation_date: new Date(),
          updated_at: new Date(),
        })
        .where(eq(tournamentRegistrationsTable.id, registrationId))
        .returning();

      return {
        success: true,
        message: 'Inscripción completada. Ahora el alumno debe subir su comprobante de pago.',
        data: updated,
      };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error en completeRegistrationByMaster:', error);
      throw new InternalServerErrorException('Error al completar la inscripción.');
    }
  }

  /**
   * MÉTODO 2: Obtener inscripciones de un evento (Master)
   * 
   * Flujo:
   * - Master ve todos los atletas inscritos en su evento
   * - Puede validar inscripciones y pagos
   */
  async getEventRegistrations(eventId: number, masterId: number) {
    try {
      // 1. Validar que el master es el creador del evento
      const [event] = await this.db
        .select()
        .from(eventsTable)
        .where(and(
          eq(eventsTable.id, eventId),
          eq(eventsTable.created_by, masterId)
        ))
        .limit(1);

      if (!event) {
        throw new NotFoundException('No tienes permiso para ver las inscripciones de este evento.');
      }

      // 2. Obtener todas las inscripciones del evento con detalles
      const registrations = await this.db
        .select({
          id: tournamentRegistrationsTable.id,
          athleteId: tournamentRegistrationsTable.athlete_id,
          athleteName: sql`CONCAT(${usersTable.name}, ' ', ${usersTable.lastname})`,
          athleteEmail: usersTable.email,
          categoryId: tournamentRegistrationsTable.category_id,
          modalityId: tournamentRegistrationsTable.modality_id,
          status: tournamentRegistrationsTable.status,
          paymentStatus: tournamentRegistrationsTable.payment_status,
          paymentMethod: tournamentRegistrationsTable.payment_method,
          paymentProofUrl: tournamentRegistrationsTable.payment_proof_url,
          registrationDate: tournamentRegistrationsTable.registration_date,
          masterValidationDate: tournamentRegistrationsTable.master_validation_date,
          rejectionReason: tournamentRegistrationsTable.rejection_reason,
        })
        .from(tournamentRegistrationsTable)
        .leftJoin(usersTable, eq(tournamentRegistrationsTable.athlete_id, usersTable.id))
        .where(eq(tournamentRegistrationsTable.event_id, eventId));

      return {
        success: true,
        eventId,
        totalRegistrations: registrations.length,
        data: registrations,
      };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error en getEventRegistrations:', error);
      throw new InternalServerErrorException('Error al obtener las inscripciones del evento.');
    }
  }

  /**
   * MÉTODO 3: Subir comprobante de pago (Alumno)
   * 
   * Flujo:
   * - Alumno sube comprobante de pago digital o referencia de efectivo
   * - Sistema cambia payment_status a 'en_espera'
   * - Master debe validar el pago después
   */
  async uploadPaymentProof(
    registrationId: number,
    athleteId: number,
    paymentMethod: string,
    paymentReference: string,
    paymentProofUrl?: string
  ) {
    try {
      // 1. Validar que el registration existe y pertenece al atleta
      const [registration] = await this.db
        .select()
        .from(tournamentRegistrationsTable)
        .where(and(
          eq(tournamentRegistrationsTable.id, registrationId),
          eq(tournamentRegistrationsTable.athlete_id, athleteId)
        ))
        .limit(1);

      if (!registration) {
        throw new NotFoundException('Inscripción no encontrada o no tienes permiso para modificarla.');
      }

      // 2. Validar que está en estado 'pendiente' o 'en_espera'
      if (!['pendiente', 'en_espera'].includes(registration.status)) {
        throw new BadRequestException(
          `No puedes subir pago para una inscripción en estado "${registration.status}".`
        );
      }

      // 3. Actualizar con información del pago
      const [updated] = await this.db
        .update(tournamentRegistrationsTable)
        .set({
          payment_method: paymentMethod,
          payment_reference: paymentReference,
          payment_proof_url: paymentProofUrl || null,
          payment_date: new Date(),
          payment_status: 'en_espera',
          updated_at: new Date(),
        })
        .where(eq(tournamentRegistrationsTable.id, registrationId))
        .returning();

      return {
        success: true,
        message: 'Comprobante de pago cargado. Espera la validación del administrador.',
        data: updated,
      };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error en uploadPaymentProof:', error);
      throw new InternalServerErrorException('Error al cargar el comprobante de pago.');
    }
  }

  /**
   * MÉTODO 4: Validar inscripción (Master)
   */
  async validateRegistration(registrationId: number, masterId: number) {
    try {
      const [registration] = await this.db
        .select()
        .from(tournamentRegistrationsTable)
        .where(eq(tournamentRegistrationsTable.id, registrationId))
        .limit(1);

      if (!registration) {
        throw new NotFoundException('Inscripción no encontrada.');
      }

      const [event] = await this.db
        .select()
        .from(eventsTable)
        .where(and(
          eq(eventsTable.id, registration.event_id),
          eq(eventsTable.created_by, masterId)
        ))
        .limit(1);

      if (!event) {
        throw new NotFoundException('No tienes permiso para validar inscripciones de este evento.');
      }

      const [updated] = await this.db
        .update(tournamentRegistrationsTable)
        .set({
          status: 'validado',
          master_id: masterId,
          master_validation_date: new Date(),
          updated_at: new Date(),
        })
        .where(eq(tournamentRegistrationsTable.id, registrationId))
        .returning();

      return {
        success: true,
        message: 'Inscripción validada exitosamente.',
        data: updated,
      };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error en validateRegistration:', error);
      throw new InternalServerErrorException('Error al validar la inscripción.');
    }
  }

  /**
   * MÉTODO 5: Validar pago (Master)
   */
  async validatePayment(registrationId: number, masterId: number) {
    try {
      const [registration] = await this.db
        .select()
        .from(tournamentRegistrationsTable)
        .where(eq(tournamentRegistrationsTable.id, registrationId))
        .limit(1);

      if (!registration) {
        throw new NotFoundException('Inscripción no encontrada.');
      }

      const [event] = await this.db
        .select()
        .from(eventsTable)
        .where(and(
          eq(eventsTable.id, registration.event_id),
          eq(eventsTable.created_by, masterId)
        ))
        .limit(1);

      if (!event) {
        throw new NotFoundException('No tienes permiso para validar pagos de este evento.');
      }

      const [updated] = await this.db
        .update(tournamentRegistrationsTable)
        .set({
          payment_status: 'pagado',
          master_id: masterId,
          master_validation_date: new Date(),
          updated_at: new Date(),
        })
        .where(eq(tournamentRegistrationsTable.id, registrationId))
        .returning();

      return {
        success: true,
        message: 'Pago validado exitosamente.',
        data: updated,
      };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error en validatePayment:', error);
      throw new InternalServerErrorException('Error al validar el pago.');
    }
  }

  /**
   * MÉTODO 6: Rechazar inscripción (Master)
   */
  async rejectRegistration(registrationId: number, masterId: number, rejectionReason: string) {
    try {
      const [registration] = await this.db
        .select()
        .from(tournamentRegistrationsTable)
        .where(eq(tournamentRegistrationsTable.id, registrationId))
        .limit(1);

      if (!registration) {
        throw new NotFoundException('Inscripción no encontrada.');
      }

      if (registration.payment_status === 'pagado') {
        throw new BadRequestException('No puedes rechazar una inscripción que ya ha sido pagada.');
      }

      const [event] = await this.db
        .select()
        .from(eventsTable)
        .where(and(
          eq(eventsTable.id, registration.event_id),
          eq(eventsTable.created_by, masterId)
        ))
        .limit(1);

      if (!event) {
        throw new NotFoundException('No tienes permiso para rechazar inscripciones de este evento.');
      }

      const [updated] = await this.db
        .update(tournamentRegistrationsTable)
        .set({
          status: 'rechazado',
          rejection_reason: rejectionReason,
          master_id: masterId,
          master_validation_date: new Date(),
          updated_at: new Date(),
        })
        .where(eq(tournamentRegistrationsTable.id, registrationId))
        .returning();

      return {
        success: true,
        message: 'Inscripción rechazada exitosamente.',
        data: updated,
      };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error en rejectRegistration:', error);
      throw new InternalServerErrorException('Error al rechazar la inscripción.');
    }
  }

  /**
   * MÉTODO 7: Obtener eventos con estado de inscripción (Alumno)
   */
  async getEventsWithEnrollmentStatus(athleteId: number) {
    try {
      const events = await this.db
        .select({
          eventId: eventsTable.id,
          eventName: eventsTable.name,
          eventDate: eventsTable.date,
          eventLocation: eventsTable.location,
          enrollmentStatus: tournamentRegistrationsTable.status,
          paymentStatus: tournamentRegistrationsTable.payment_status,
        })
        .from(eventsTable)
        .innerJoin(eventCategoriesTable, eq(eventsTable.id, eventCategoriesTable.event_id))
        .innerJoin(eventDivisionsTable, eq(eventCategoriesTable.id, eventDivisionsTable.event_category_id))
        .leftJoin(
          tournamentRegistrationsTable,
          and(
            eq(tournamentRegistrationsTable.division_id, eventDivisionsTable.id),
            eq(tournamentRegistrationsTable.athlete_id, athleteId)
          )
        )
        .where(and(
          eq(eventCategoriesTable.is_active, true),
          eq(eventDivisionsTable.is_active, true)
        ));

      return {
        success: true,
        totalEvents: events.length,
        data: events,
      };
    } catch (error) {
      this.logger.error('Error en getEventsWithEnrollmentStatus:', error);
      throw new InternalServerErrorException('Error al obtener los eventos disponibles.');
    }
  }

}
