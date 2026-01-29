import { BadRequestException, Inject, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { eventsTable, eventStatus_scheduled, notificationsTable, statusTable, subtypesEventsTable, typesEventsTable, usersTable } from '../db/schema';
import { PG_CONNECTION, ROL_MASTER } from '../constants';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { and, eq, gte, ilike, lte, or, sql, SQL } from 'drizzle-orm';
import { PaginationEventsDto } from './dto/pagination-events.dto';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(@Inject(PG_CONNECTION) private readonly db: NeonDatabase) {}

  async findAll(query: PaginationEventsDto) {console.log("parametros recibidos",query);
    const { page, limit, search, typeFilter, statusFilter, startDateFilter, endDateFilter } = query;

    try {
        const offset = (page - 1) * limit;
        const whereConditions: SQL[] = [];

        // 1. Filtro de búsqueda (Búsqueda insensible a mayúsculas)
        if (search) {
        whereConditions.push(
            or(
            ilike(eventsTable.name, `%${search}%`),
            ilike(eventsTable.location, `%${search}%`)
            )
        );
        }
        // 2. Filtros por ID (Validación de tipos ya viene del DTO)
        if (typeFilter) {
            console.log("filtro por tipo de evento:",typeFilter);
            whereConditions.push(eq(subtypesEventsTable.type_id, typeFilter));

        }
        if (statusFilter) whereConditions.push(eq(eventsTable.status_id, statusFilter));

        // 3. Lógica de Fechas (Rango vs Única)
        if (startDateFilter && endDateFilter) {
        whereConditions.push(and(gte(eventsTable.date, startDateFilter), lte(eventsTable.date, endDateFilter)));
        } else if (startDateFilter) {
        whereConditions.push(eq(eventsTable.date, startDateFilter));
        }

        const finalWhere = whereConditions.length > 0 ? and(...whereConditions) : undefined;

        // 4. Ejecución de consultas en paralelo para mejorar rendimiento
        const [totalResult, data] = await Promise.all([
        this.db
            .select({ count: sql<number>`count(*)` })
            .from(eventsTable)
            .leftJoin(subtypesEventsTable, eq(eventsTable.subtype_id, subtypesEventsTable.id))
            .leftJoin(typesEventsTable, eq(subtypesEventsTable.type_id, typesEventsTable.id))
            .leftJoin(statusTable, eq(eventsTable.status_id, statusTable.id))
            .where(finalWhere),
        this.db
            .select({
            id: eventsTable.id,
            name: eventsTable.name,
            description: eventsTable.description,
            date: eventsTable.date,
            location: eventsTable.location,
            max_participants: eventsTable.max_participants,
            // Unimos con las tablas de nombres para que el front no reciba solo IDs
            type_id: subtypesEventsTable.type_id,
            type: typesEventsTable.type,
            subtype: subtypesEventsTable.subtype,
            status_id: eventsTable.status_id,
            status: statusTable.status,
            })
            .from(eventsTable)
            .leftJoin(subtypesEventsTable, eq(eventsTable.subtype_id, subtypesEventsTable.id))
            .leftJoin(typesEventsTable, eq(subtypesEventsTable.type_id, typesEventsTable.id))
            .leftJoin(statusTable, eq(eventsTable.status_id, statusTable.id))
            .where(finalWhere)
            .limit(limit)
            .offset(offset)
            .orderBy(sql`${eventsTable.date} DESC`) // Ordenar por fecha más reciente
        ]);

        const total = Number(totalResult[0]?.count ?? 0);

        // 5. Gestión de error de lógica: Página fuera de rango
        const totalPages = Math.ceil(total / limit);
        if (page > totalPages && total > 0) {
        throw new BadRequestException(`La página ${page} no existe. El máximo es ${totalPages}.`);
        }

        return {
        data,
        meta: {
            total,
            page,
            limit,
            totalPages,
        },
        };

    } catch (error) {
        // Si es un error controlado por nosotros, lo relanzamos
        if (error instanceof BadRequestException) throw error;

        // Error de sintaxis en la base de datos (ej: formato de fecha inválido que saltó el DTO)
        if (error.code === '22007' || error.code === '22P02') {
        throw new BadRequestException('El formato de los filtros (fecha o IDs) es inválido.');
        }

        console.error('ERROR_FINDALL_EVENTS:', error);
        throw new InternalServerErrorException('Error al procesar la lista de eventos. Por favor, contacte al administrador.');
    }
  }

// events.service.ts
async create(createEventDto: CreateEventDto, creatorId: number) {
  // 1. Iniciar transacción
  return await this.db.transaction(async (tx) => {
    try {
      // VALIDACIÓN DE SUBTIPO (Igual que antes pero usando 'tx')
      const subtypeExists = await tx
        .select()
        .from(subtypesEventsTable)
        .where(eq(subtypesEventsTable.id, createEventDto.subtype_id))
        .limit(1);

      if (subtypeExists.length === 0) {
        throw new BadRequestException(`El subtipo de evento no es válido.`);
      }

      // 2. INSERCIÓN DEL EVENTO
      const params = {
        ...createEventDto,
        created_by: creatorId, // <-- Guardamos quién lo creó
        status_id: eventStatus_scheduled,
        max_participants: createEventDto.max_participants ?? 0,
        max_evaluation_score: createEventDto.max_evaluation_score ?? 0,
      };
      
      // Eliminamos campos que no van a la tabla de eventos si es necesario
      delete (params as any).send_to_all_masters;
      delete (params as any).selected_master_ids;

      const [newEvent] = await tx
        .insert(eventsTable)
        .values(params as any)
        .returning();

      // 3. IDENTIFICAR DESTINATARIOS
      let mastersToNotify: number[] = [];

      if (createEventDto.send_to_all_masters) {
        // Buscamos usuarios que tengan el rol Master:2 
        const masters = await tx
          .select({ id: usersTable.id })
          .from(usersTable)
          .where(sql`${usersTable.roles_ids} @> ${JSON.stringify([ROL_MASTER])}::jsonb`); // Operador "contiene" de Postgres
        mastersToNotify = masters.map((m) => m.id);
      } else if (createEventDto.selected_master_ids) {
        mastersToNotify = createEventDto.selected_master_ids;
      }

      // 4. INSERCIÓN MASIVA DE NOTIFICACIONES
      if (mastersToNotify.length > 0) {
        const notifications = mastersToNotify.map((masterId) => ({
          sender_id: creatorId,    // <-- Quién envía
          recipient_id: masterId,  // <-- Quién recibe
          event_id: newEvent.id,
          title: `Nueva Convocatoria: ${newEvent.name}`,
          message: `Se ha creado un nuevo evento de tipo ${subtypeExists[0].subtype}.`,
          is_read: false,
        }));

        await tx.insert(notificationsTable).values(notifications);
      }

      return {
        message: 'Evento creado y notificaciones enviadas',
        data: newEvent,
      };

    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      console.error('ERROR_CREATING_EVENT:', error);
      throw new InternalServerErrorException('Error al crear el evento y notificar.');
    }
  });
}
  //creacion del evnto - funcional(sin notificaciones)
/*   async create(createEventDto: CreateEventDto) {
    try {
    // 1. Validación de existencia del subtipo
    const subtypeExists = await this.db
        .select()
        .from(subtypesEventsTable)
        .where(eq(subtypesEventsTable.id, createEventDto.subtype_id))
        .limit(1);

    if (subtypeExists.length === 0) {
        throw new BadRequestException(`El subtipo de evento (${createEventDto.subtype_id}) no es válido.`);
    }

    // 2. Preparación de datos con valores por defecto
    const params = {
        ...createEventDto,
        status_id: eventStatus_scheduled,
        max_participants: createEventDto.max_participants ?? 0,
        max_evaluation_score: createEventDto.max_evaluation_score ?? 0, 
    };

    // 3. Inserción
    const [newEvent] = await this.db
        .insert(eventsTable)
        .values(params)
        .returning();

    return {
        message: 'Evento creado exitosamente',
        data: newEvent,
    };

    } catch (error) {
    if (error instanceof BadRequestException) throw error;
    
    console.error('ERROR_CREATING_EVENT:', error);
    throw new InternalServerErrorException('Error al crear el evento.');
    }
  } */

  async findOne(id: number) {   
    try {
        const [event] = await this.db
        .select({
            id: eventsTable.id,
            name: eventsTable.name,
            description: eventsTable.description,
            date: eventsTable.date,
            location: eventsTable.location,
            status: statusTable.status,
            status_id: eventsTable.status_id,
            type_id: subtypesEventsTable.type_id,
            type: typesEventsTable.type,
            subtype_id: subtypesEventsTable.id,
            subtype: subtypesEventsTable.subtype,
            max_participants: eventsTable.max_participants,
            max_evaluation_score: eventsTable.max_evaluation_score,
        })
        .from(eventsTable)
        .leftJoin(statusTable, eq(eventsTable.status_id, statusTable.id))
        .leftJoin(subtypesEventsTable, eq(eventsTable.subtype_id, subtypesEventsTable.id))
        .leftJoin(typesEventsTable, eq(subtypesEventsTable.type_id, typesEventsTable.id))
        .where(eq(eventsTable.id, id))
        .limit(1);

        // 2. Manejo de error si el ID no existe en la base de datos
        if (!event) {
        throw new BadRequestException(`El evento con ID ${id} no fue encontrado.`);
        }

        return {
        success: true,
        data: event,
        };

    } catch (error) {
        if (error instanceof BadRequestException) throw error;
        
        console.error(`[EventsService.findOne] Error:`, error);
        throw new InternalServerErrorException('Error al obtener los detalles del evento.');
    }
  }

  async update(id: number, updateEventDto: UpdateEventDto) {
    try {
      // 1. Verificar existencia del evento y obtener su estado actual
      const [currentEvent] = await this.db
        .select({ 
          id: eventsTable.id, 
          status_id: eventsTable.status_id 
        })
        .from(eventsTable)
        .where(eq(eventsTable.id, id))
        .limit(1);

      if (!currentEvent) {
        throw new BadRequestException(`El evento con ID ${id} no existe.`);
      }

      // 2. Lógica de negocio: No permitir editar eventos finalizados o cancelados
      // Asumiendo IDs de tu seed: 6 (Finalizado), 7 (Cancelado)
      if ([6, 7].includes(currentEvent.status_id)) {
        throw new BadRequestException(
          'No se puede modificar un evento que ya ha sido finalizado o cancelado.'
        );
      }

      // 3. Validar integridad de subtype_id (si se incluye en el body)
      if (updateEventDto.subtype_id) {
        const [subtype] = await this.db
          .select()
          .from(subtypesEventsTable)
          .where(eq(subtypesEventsTable.id, updateEventDto.subtype_id))
          .limit(1);

        if (!subtype) {
          throw new BadRequestException(
            `El subtipo de evento (${updateEventDto.subtype_id}) no es válido.`
          );
        }
      }

      // 4. Validar integridad de status_id (si se incluye en el body)
      if (updateEventDto.status_id) {
        const [status] = await this.db
          .select()
          .from(statusTable)
          .where(eq(statusTable.id, updateEventDto.status_id))
          .limit(1);

        if (!status) {
          throw new BadRequestException(
            `El estado (${updateEventDto.status_id}) no existe en la base de datos.`
          );
        }
      }

      // 5. Ejecutar la actualización
       const params = {
          ...updateEventDto,
          updated_at: new Date(), // Actualización manual del timestamp
       }

      const [updatedEvent] = await this.db
        .update(eventsTable)
        .set(params)
        .where(eq(eventsTable.id, id))
        .returning();

      return {
        message: 'Evento actualizado exitosamente',
        data: updatedEvent,
      };

    } catch (error) {
      // Manejo de excepciones controladas
      if (error instanceof BadRequestException) throw error;

      // Errores de base de datos (Ej: Formato de fecha inválido 22007)
      if (error.code === '22007' || error.code === '22P02') {
        throw new BadRequestException('Los datos proporcionados tienen un formato inválido.');
      }

      console.error('ERROR_UPDATING_EVENT:', error);
      throw new InternalServerErrorException(
        'Error interno al actualizar el evento. Intente más tarde.'
      );
    }
  }

    async changeStatus(id: number, status_id: number) {
    try {
        // 1. Verificar existencia del evento
        const [event] = await this.db
        .select({ id: eventsTable.id, status_id: eventsTable.status_id })
        .from(eventsTable)
        .where(eq(eventsTable.id, id))
        .limit(1);

        if (!event) {
        throw new BadRequestException(`El evento con ID ${id} no existe.`);
        }

        // 2. Validar transiciones prohibidas
        if (event.status_id === status_id) {
        const msg = status_id === 4 ? 'habilitado' : 'inhabilitado';
        throw new BadRequestException(`El evento ya se encuentra ${msg}.`);
        }

        // No permitir re-habilitar o cancelar eventos finalizados (ID 6)
        if (event.status_id === 6) {
        throw new BadRequestException('No se puede cambiar el estado de un evento que ya ha finalizado.');
        }

        // 3. Ejecutar actualización
        const [updatedEvent] = await this.db
        .update(eventsTable)
        .set({
            status_id: status_id,
            updated_at: new Date(),
        } as any)
        .where(eq(eventsTable.id, id))
        .returning();

        return {
        message: `Evento ${status_id === 4 ? 'habilitado' : 'inhabilitado'} exitosamente`,
        data: updatedEvent,
        };
    } catch (error) {
        if (error instanceof BadRequestException) throw error;
        console.error('ERROR_CHANGE_STATUS:', error);
        throw new InternalServerErrorException('Error al procesar el cambio de estado.');
    }
    }

  async disable(id: number) {
    try {
        // 1. Verificar existencia y estado actual
        const [event] = await this.db
        .select({ 
            id: eventsTable.id, 
            status_id: eventsTable.status_id 
        })
        .from(eventsTable)
        .where(eq(eventsTable.id, id))
        .limit(1);

        if (!event) {
        throw new BadRequestException(`El evento con ID ${id} no existe.`);
        }

        // 2. Validar si ya está cancelado (ID 7) o finalizado (ID 6) según tu seed
        if (event.status_id === 7) {
        throw new BadRequestException('El evento ya se encuentra inhabilitado.');
        }
        
        if (event.status_id === 6) {
        throw new BadRequestException('No se puede inhabilitar un evento que ya ha finalizado.');
        }

        // 3. Ejecutar actualización (SOLUCIÓN AL ERROR DE TIPADO)
        // Si TypeScript sigue protestando, usamos un cast de tipo temporal.
        const [disabledEvent] = await this.db
        .update(eventsTable)
        .set({
            status_id: 7, // ID de 'Evento cancelado' en tu statusTable
            updated_at: new Date(), //
        } as any) // El cast 'as any' asegura que pase el chequeo si el esquema tiene desajustes de tipos
        .where(eq(eventsTable.id, id))
        .returning();

        return {
        message: 'Evento inhabilitado correctamente',
        data: {
            id: disabledEvent.id,
            status: 'Evento cancelado',
        },
        };
    } catch (error) {
        if (error instanceof BadRequestException) throw error;
        console.error('ERROR_DISABLING_EVENT:', error);
        throw new InternalServerErrorException('Error al intentar inhabilitar el evento.');
    }
  }
  
  //calendario eventos
async getEventsForCalendar(year: number, month?: number) {
  try {
    const whereConditions = [
      // El año siempre es obligatorio en esta lógica
      sql`EXTRACT(YEAR FROM ${eventsTable.date}) = ${year}`
    ];

    // Si recibimos el mes, lo agregamos a los filtros
    if (month) {
      whereConditions.push(sql`EXTRACT(MONTH FROM ${eventsTable.date}) = ${month}`);
    }

    const events = await this.db
      .select({
        id: eventsTable.id,
        name: eventsTable.name,
        description: eventsTable.description,
        date: eventsTable.date,
        location: eventsTable.location,
        status_id: eventsTable.status_id,
        status_name: statusTable.status, 
      })
      .from(eventsTable)
      .innerJoin(statusTable, eq(eventsTable.status_id, statusTable.id))
      .where(and(...whereConditions)) // Descomponemos el arreglo de condiciones
      .orderBy(eventsTable.date);

    // Agrupamos los eventos por fecha (YYYY-MM-DD)
    return events.reduce((acc, event) => {
      const dateKey = typeof event.date === 'string' 
        ? event.date 
        : (event.date as Date).toISOString().split('T')[0];
      
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(event);
      return acc;
    }, {} as Record<string, typeof events>);

  } catch (error) {
    this.logger.error('Error al obtener eventos:', error);
    throw new InternalServerErrorException('Error al cargar la vista cronológica.');
  }
}

}