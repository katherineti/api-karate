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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsService = void 0;
const common_1 = require("@nestjs/common");
const schema_1 = require("../db/schema");
const constants_1 = require("../constants");
const neon_serverless_1 = require("drizzle-orm/neon-serverless");
const drizzle_orm_1 = require("drizzle-orm");
let EventsService = class EventsService {
    constructor(db) {
        this.db = db;
    }
    async findAll(query) {
        const { page, limit, search, typeFilter, statusFilter, startDateFilter, endDateFilter } = query;
        try {
            const offset = (page - 1) * limit;
            const whereConditions = [];
            if (search) {
                whereConditions.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.ilike)(schema_1.eventsTable.name, `%${search}%`), (0, drizzle_orm_1.ilike)(schema_1.eventsTable.location, `%${search}%`)));
            }
            if (typeFilter)
                whereConditions.push((0, drizzle_orm_1.eq)(schema_1.subtypesEventsTable.type_id, typeFilter));
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
                    .where(finalWhere),
                this.db
                    .select({
                    id: schema_1.eventsTable.id,
                    name: schema_1.eventsTable.name,
                    description: schema_1.eventsTable.description,
                    date: schema_1.eventsTable.date,
                    location: schema_1.eventsTable.location,
                    max_participants: schema_1.eventsTable.max_participants,
                    type: schema_1.typesEventsTable.type,
                    subtype: schema_1.subtypesEventsTable.subtype,
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
    async create(createEventDto) {
        try {
            const subtypeExists = await this.db
                .select()
                .from(schema_1.subtypesEventsTable)
                .where((0, drizzle_orm_1.eq)(schema_1.subtypesEventsTable.id, createEventDto.subtype_id))
                .limit(1);
            if (subtypeExists.length === 0) {
                throw new common_1.BadRequestException(`El subtipo de evento (${createEventDto.subtype_id}) no es válido.`);
            }
            const params = {
                ...createEventDto,
                status_id: schema_1.eventStatus_scheduled,
                max_participants: createEventDto.max_participants ?? 0,
                max_evaluation_score: createEventDto.max_evaluation_score ?? 0,
            };
            const [newEvent] = await this.db
                .insert(schema_1.eventsTable)
                .values(params)
                .returning();
            return {
                message: 'Evento creado exitosamente',
                data: newEvent,
            };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException)
                throw error;
            console.error('ERROR_CREATING_EVENT:', error);
            throw new common_1.InternalServerErrorException('Error al crear el evento.');
        }
    }
    findOne(id) {
        return `This action returns a #${id} event`;
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
};
exports.EventsService = EventsService;
exports.EventsService = EventsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(constants_1.PG_CONNECTION)),
    __metadata("design:paramtypes", [neon_serverless_1.NeonDatabase])
], EventsService);
//# sourceMappingURL=events.service.js.map