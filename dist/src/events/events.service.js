"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var EventsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsService = void 0;
const common_1 = require("@nestjs/common");
const schema_1 = require("../db/schema");
const constants_1 = require("../constants");
const neon_serverless_1 = require("drizzle-orm/neon-serverless");
const drizzle_orm_1 = require("drizzle-orm");
let EventsService = EventsService_1 = class EventsService {
    constructor(db) {
        this.db = db;
        this.logger = new common_1.Logger(EventsService_1.name);
    }
    async findAll(query) {
        console.log("parametros recibidos", query);
        const { page, limit, search, typeFilter, statusFilter, startDateFilter, endDateFilter } = query;
        try {
            const offset = (page - 1) * limit;
            const whereConditions = [];
            if (search) {
                whereConditions.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.ilike)(schema_1.eventsTable.name, `%${search}%`), (0, drizzle_orm_1.ilike)(schema_1.eventsTable.location, `%${search}%`)));
            }
            if (typeFilter) {
                console.log("filtro por tipo de evento:", typeFilter);
                whereConditions.push((0, drizzle_orm_1.eq)(schema_1.subtypesEventsTable.type_id, typeFilter));
            }
            if (statusFilter)
                whereConditions.push((0, drizzle_orm_1.eq)(schema_1.eventsTable.status_id, statusFilter));
            if (startDateFilter && endDateFilter) {
                whereConditions.push((0, drizzle_orm_1.and)((0, drizzle_orm_1.gte)(schema_1.eventsTable.date, startDateFilter), (0, drizzle_orm_1.lte)(schema_1.eventsTable.date, endDateFilter)));
            }
            else if (startDateFilter) {
                whereConditions.push((0, drizzle_orm_1.eq)(schema_1.eventsTable.date, startDateFilter));
            }
            const finalWhere = whereConditions.length > 0 ? (0, drizzle_orm_1.and)(...whereConditions) : undefined;
            const [totalResult, data] = await Promise.all([
                this.db
                    .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
                    .from(schema_1.eventsTable)
                    .leftJoin(schema_1.subtypesEventsTable, (0, drizzle_orm_1.eq)(schema_1.eventsTable.subtype_id, schema_1.subtypesEventsTable.id))
                    .leftJoin(schema_1.typesEventsTable, (0, drizzle_orm_1.eq)(schema_1.subtypesEventsTable.type_id, schema_1.typesEventsTable.id))
                    .leftJoin(schema_1.statusTable, (0, drizzle_orm_1.eq)(schema_1.eventsTable.status_id, schema_1.statusTable.id))
                    .where(finalWhere),
                this.db
                    .select({
                    id: schema_1.eventsTable.id,
                    name: schema_1.eventsTable.name,
                    description: schema_1.eventsTable.description,
                    date: schema_1.eventsTable.date,
                    location: schema_1.eventsTable.location,
                    max_participants: schema_1.eventsTable.max_participants,
                    type_id: schema_1.subtypesEventsTable.type_id,
                    type: schema_1.typesEventsTable.type,
                    subtype: schema_1.subtypesEventsTable.subtype,
                    status_id: schema_1.eventsTable.status_id,
                    status: schema_1.statusTable.status,
                })
                    .from(schema_1.eventsTable)
                    .leftJoin(schema_1.subtypesEventsTable, (0, drizzle_orm_1.eq)(schema_1.eventsTable.subtype_id, schema_1.subtypesEventsTable.id))
                    .leftJoin(schema_1.typesEventsTable, (0, drizzle_orm_1.eq)(schema_1.subtypesEventsTable.type_id, schema_1.typesEventsTable.id))
                    .leftJoin(schema_1.statusTable, (0, drizzle_orm_1.eq)(schema_1.eventsTable.status_id, schema_1.statusTable.id))
                    .where(finalWhere)
                    .limit(limit)
                    .offset(offset)
                    .orderBy((0, drizzle_orm_1.sql) `${schema_1.eventsTable.date} DESC`)
            ]);
            const total = Number(totalResult[0]?.count ?? 0);
            const totalPages = Math.ceil(total / limit);
            if (page > totalPages && total > 0) {
                throw new common_1.BadRequestException(`La página ${page} no existe. El máximo es ${totalPages}.`);
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
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException)
                throw error;
            if (error.code === '22007' || error.code === '22P02') {
                throw new common_1.BadRequestException('El formato de los filtros (fecha o IDs) es inválido.');
            }
            console.error('ERROR_FINDALL_EVENTS:', error);
            throw new common_1.InternalServerErrorException('Error al procesar la lista de eventos. Por favor, contacte al administrador.');
        }
    }
    async create(createEventDto, creatorId) {
        return await this.db.transaction(async (tx) => {
            try {
                const subtypeExists = await tx
                    .select()
                    .from(schema_1.subtypesEventsTable)
                    .where((0, drizzle_orm_1.eq)(schema_1.subtypesEventsTable.id, createEventDto.subtype_id))
                    .limit(1);
                if (subtypeExists.length === 0) {
                    throw new common_1.BadRequestException(`El subtipo de evento no es válido.`);
                }
                const params = {
                    ...createEventDto,
                    created_by: creatorId,
                    status_id: schema_1.eventStatus_scheduled,
                    max_participants: createEventDto.max_participants ?? 0,
                    max_evaluation_score: createEventDto.max_evaluation_score ?? 0,
                };
                delete params.send_to_all_masters;
                delete params.selected_master_ids;
                const [newEvent] = await tx
                    .insert(schema_1.eventsTable)
                    .values(params)
                    .returning();
                let mastersToNotify = [];
                if (createEventDto.send_to_all_masters) {
                    const masters = await tx
                        .select({ id: schema_1.usersTable.id })
                        .from(schema_1.usersTable)
                        .where((0, drizzle_orm_1.sql) `${schema_1.usersTable.roles_ids} @> ${JSON.stringify([constants_1.ROL_MASTER])}::jsonb`);
                    mastersToNotify = masters.map((m) => m.id);
                }
                else if (createEventDto.selected_master_ids) {
                    mastersToNotify = createEventDto.selected_master_ids;
                }
                if (mastersToNotify.length > 0) {
                    const notifications = mastersToNotify.map((masterId) => ({
                        sender_id: creatorId,
                        recipient_id: masterId,
                        event_id: newEvent.id,
                        title: `Nueva Convocatoria: ${newEvent.name}`,
                        message: `Se ha creado un nuevo evento de tipo ${subtypeExists[0].subtype}.`,
                        is_read: false,
                    }));
                    await tx.insert(schema_1.notificationsTable).values(notifications);
                }
                return {
                    message: 'Evento creado y notificaciones enviadas',
                    data: newEvent,
                };
            }
            catch (error) {
                if (error instanceof common_1.BadRequestException)
                    throw error;
                console.error('ERROR_CREATING_EVENT:', error);
                throw new common_1.InternalServerErrorException('Error al crear el evento y notificar.');
            }
        });
    }
    async findOne(id) {
        try {
            const [event] = await this.db
                .select({
                id: schema_1.eventsTable.id,
                name: schema_1.eventsTable.name,
                description: schema_1.eventsTable.description,
                date: schema_1.eventsTable.date,
                location: schema_1.eventsTable.location,
                status: schema_1.statusTable.status,
                status_id: schema_1.eventsTable.status_id,
                type_id: schema_1.subtypesEventsTable.type_id,
                type: schema_1.typesEventsTable.type,
                subtype_id: schema_1.subtypesEventsTable.id,
                subtype: schema_1.subtypesEventsTable.subtype,
                max_participants: schema_1.eventsTable.max_participants,
                max_evaluation_score: schema_1.eventsTable.max_evaluation_score,
            })
                .from(schema_1.eventsTable)
                .leftJoin(schema_1.statusTable, (0, drizzle_orm_1.eq)(schema_1.eventsTable.status_id, schema_1.statusTable.id))
                .leftJoin(schema_1.subtypesEventsTable, (0, drizzle_orm_1.eq)(schema_1.eventsTable.subtype_id, schema_1.subtypesEventsTable.id))
                .leftJoin(schema_1.typesEventsTable, (0, drizzle_orm_1.eq)(schema_1.subtypesEventsTable.type_id, schema_1.typesEventsTable.id))
                .where((0, drizzle_orm_1.eq)(schema_1.eventsTable.id, id))
                .limit(1);
            if (!event) {
                throw new common_1.BadRequestException(`El evento con ID ${id} no fue encontrado.`);
            }
            return {
                success: true,
                data: event,
            };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException)
                throw error;
            console.error(`[EventsService.findOne] Error:`, error);
            throw new common_1.InternalServerErrorException('Error al obtener los detalles del evento.');
        }
    }
    async update(id, updateEventDto) {
        try {
            const [currentEvent] = await this.db
                .select({
                id: schema_1.eventsTable.id,
                status_id: schema_1.eventsTable.status_id
            })
                .from(schema_1.eventsTable)
                .where((0, drizzle_orm_1.eq)(schema_1.eventsTable.id, id))
                .limit(1);
            if (!currentEvent) {
                throw new common_1.BadRequestException(`El evento con ID ${id} no existe.`);
            }
            if ([6, 7].includes(currentEvent.status_id)) {
                throw new common_1.BadRequestException('No se puede modificar un evento que ya ha sido finalizado o cancelado.');
            }
            if (updateEventDto.subtype_id) {
                const [subtype] = await this.db
                    .select()
                    .from(schema_1.subtypesEventsTable)
                    .where((0, drizzle_orm_1.eq)(schema_1.subtypesEventsTable.id, updateEventDto.subtype_id))
                    .limit(1);
                if (!subtype) {
                    throw new common_1.BadRequestException(`El subtipo de evento (${updateEventDto.subtype_id}) no es válido.`);
                }
            }
            if (updateEventDto.status_id) {
                const [status] = await this.db
                    .select()
                    .from(schema_1.statusTable)
                    .where((0, drizzle_orm_1.eq)(schema_1.statusTable.id, updateEventDto.status_id))
                    .limit(1);
                if (!status) {
                    throw new common_1.BadRequestException(`El estado (${updateEventDto.status_id}) no existe en la base de datos.`);
                }
            }
            const params = {
                ...updateEventDto,
                updated_at: new Date(),
            };
            const [updatedEvent] = await this.db
                .update(schema_1.eventsTable)
                .set(params)
                .where((0, drizzle_orm_1.eq)(schema_1.eventsTable.id, id))
                .returning();
            return {
                message: 'Evento actualizado exitosamente',
                data: updatedEvent,
            };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException)
                throw error;
            if (error.code === '22007' || error.code === '22P02') {
                throw new common_1.BadRequestException('Los datos proporcionados tienen un formato inválido.');
            }
            console.error('ERROR_UPDATING_EVENT:', error);
            throw new common_1.InternalServerErrorException('Error interno al actualizar el evento. Intente más tarde.');
        }
    }
    async changeStatus(id, status_id) {
        try {
            const [event] = await this.db
                .select({ id: schema_1.eventsTable.id, status_id: schema_1.eventsTable.status_id })
                .from(schema_1.eventsTable)
                .where((0, drizzle_orm_1.eq)(schema_1.eventsTable.id, id))
                .limit(1);
            if (!event) {
                throw new common_1.BadRequestException(`El evento con ID ${id} no existe.`);
            }
            if (event.status_id === status_id) {
                const msg = status_id === 4 ? 'habilitado' : 'inhabilitado';
                throw new common_1.BadRequestException(`El evento ya se encuentra ${msg}.`);
            }
            if (event.status_id === 6) {
                throw new common_1.BadRequestException('No se puede cambiar el estado de un evento que ya ha finalizado.');
            }
            const [updatedEvent] = await this.db
                .update(schema_1.eventsTable)
                .set({
                status_id: status_id,
                updated_at: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema_1.eventsTable.id, id))
                .returning();
            return {
                message: `Evento ${status_id === 4 ? 'habilitado' : 'inhabilitado'} exitosamente`,
                data: updatedEvent,
            };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException)
                throw error;
            console.error('ERROR_CHANGE_STATUS:', error);
            throw new common_1.InternalServerErrorException('Error al procesar el cambio de estado.');
        }
    }
    async disable(id) {
        try {
            const [event] = await this.db
                .select({
                id: schema_1.eventsTable.id,
                status_id: schema_1.eventsTable.status_id
            })
                .from(schema_1.eventsTable)
                .where((0, drizzle_orm_1.eq)(schema_1.eventsTable.id, id))
                .limit(1);
            if (!event) {
                throw new common_1.BadRequestException(`El evento con ID ${id} no existe.`);
            }
            if (event.status_id === 7) {
                throw new common_1.BadRequestException('El evento ya se encuentra inhabilitado.');
            }
            if (event.status_id === 6) {
                throw new common_1.BadRequestException('No se puede inhabilitar un evento que ya ha finalizado.');
            }
            const [disabledEvent] = await this.db
                .update(schema_1.eventsTable)
                .set({
                status_id: 7,
                updated_at: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema_1.eventsTable.id, id))
                .returning();
            return {
                message: 'Evento inhabilitado correctamente',
                data: {
                    id: disabledEvent.id,
                    status: 'Evento cancelado',
                },
            };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException)
                throw error;
            console.error('ERROR_DISABLING_EVENT:', error);
            throw new common_1.InternalServerErrorException('Error al intentar inhabilitar el evento.');
        }
    }
    async getEventsForCalendar(month, year) {
        try {
            const events = await this.db
                .select({
                id: schema_1.eventsTable.id,
                name: schema_1.eventsTable.name,
                description: schema_1.eventsTable.description,
                date: schema_1.eventsTable.date,
                location: schema_1.eventsTable.location,
                status_id: schema_1.eventsTable.status_id,
                status_name: schema_1.statusTable.status,
            })
                .from(schema_1.eventsTable)
                .innerJoin(schema_1.statusTable, (0, drizzle_orm_1.eq)(schema_1.eventsTable.status_id, schema_1.statusTable.id))
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.sql) `EXTRACT(MONTH FROM ${schema_1.eventsTable.date}) = ${month}`, (0, drizzle_orm_1.sql) `EXTRACT(YEAR FROM ${schema_1.eventsTable.date}) = ${year}`))
                .orderBy(schema_1.eventsTable.date);
            const calendarMap = events.reduce((acc, event) => {
                const dateKey = typeof event.date === 'string'
                    ? event.date
                    : event.date.toISOString().split('T')[0];
                if (!acc[dateKey]) {
                    acc[dateKey] = [];
                }
                acc[dateKey].push(event);
                return acc;
            }, {});
            return calendarMap;
        }
        catch (error) {
            this.logger.error('Error al obtener calendario de eventos:', error);
            throw new common_1.InternalServerErrorException('No se pudo cargar el calendario.');
        }
    }
};
exports.EventsService = EventsService;
exports.EventsService = EventsService = EventsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(constants_1.PG_CONNECTION)),
    __metadata("design:paramtypes", [neon_serverless_1.NeonDatabase])
], EventsService);
//# sourceMappingURL=events.service.js.map