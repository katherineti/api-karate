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
var TournamentRegistrationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TournamentRegistrationsService = void 0;
const common_1 = require("@nestjs/common");
const constants_1 = require("../constants");
const neon_serverless_1 = require("drizzle-orm/neon-serverless");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
let TournamentRegistrationsService = TournamentRegistrationsService_1 = class TournamentRegistrationsService {
    constructor(db) {
        this.db = db;
        this.logger = new common_1.Logger(TournamentRegistrationsService_1.name);
    }
    async bulkRegisterAthletes(dto) {
        return await this.db.transaction(async (tx) => {
            const [event] = await tx
                .select()
                .from(schema_1.eventsTable)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.eventsTable.id, dto.event_id), (0, drizzle_orm_1.eq)(schema_1.eventsTable.created_by, dto.master_id)))
                .limit(1);
            if (!event) {
                throw new common_1.NotFoundException('El evento seleccionado no existe o no tienes permiso.');
            }
            const targetEventId = dto.event_id;
            const [extraRequest] = await tx
                .select()
                .from(schema_1.participantRequestsTable)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.participantRequestsTable.event_id, targetEventId), (0, drizzle_orm_1.eq)(schema_1.participantRequestsTable.master_id, dto.master_id), (0, drizzle_orm_1.eq)(schema_1.participantRequestsTable.status, 'approved')))
                .limit(1);
            const limitAllowed = extraRequest ? extraRequest.num_participants_requested : 10;
            const currentInscriptions = await tx
                .select({
                totalInscritos: (0, drizzle_orm_1.sql) `count(distinct ${schema_1.tournamentRegistrationsTable.athlete_id})`
            })
                .from(schema_1.tournamentRegistrationsTable)
                .leftJoin(schema_1.usersTable, (0, drizzle_orm_1.eq)(schema_1.tournamentRegistrationsTable.athlete_id, schema_1.usersTable.id))
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.tournamentRegistrationsTable.event_id, targetEventId), (0, drizzle_orm_1.sql) `${schema_1.tournamentRegistrationsTable.athlete_id} IN (
          SELECT id FROM users WHERE school_id = ${dto.school_id}
        )`));
            const inscritosActuales = Number(currentInscriptions[0].totalInscritos);
            if (inscritosActuales + dto.athlete_ids.length > limitAllowed) {
                throw new common_1.BadRequestException(`Cupo insuficiente para el evento. Tienes ${inscritosActuales} inscritos de ${limitAllowed} permitidos.`);
            }
            const dataToInsert = dto.athlete_ids.map(athleteId => ({
                athlete_id: athleteId,
                event_id: dto.event_id,
                category_id: dto.category_id,
                modality_id: dto.modality_id,
                status: 'confirmado',
                payment_status: 'pagado',
                registration_date: new Date(),
                created_at: new Date(),
                updated_at: new Date(),
            }));
            try {
                await tx.insert(schema_1.tournamentRegistrationsTable).values(dataToInsert);
            }
            catch (error) {
                if (error.code === '23505') {
                    throw new common_1.BadRequestException('Uno o más atletas ya están inscritos en este evento.');
                }
                throw error;
            }
            return {
                success: true,
                message: `${dto.athlete_ids.length} atletas registrados exitosamente.`,
                remainingSlots: limitAllowed - (inscritosActuales + dto.athlete_ids.length)
            };
        });
    }
    async getAthletesByDivisionAndSchool(modalityId, schoolId) {
        try {
            const athletes = await this.db
                .select({
                id: schema_1.usersTable.id,
                name: schema_1.usersTable.name,
                lastname: schema_1.usersTable.lastname,
                email: schema_1.usersTable.email,
                status: schema_1.usersTable.status,
                registrationId: schema_1.tournamentRegistrationsTable.id,
                registrationStatus: schema_1.tournamentRegistrationsTable.status,
                categoryId: schema_1.tournamentRegistrationsTable.category_id,
                modalityId: schema_1.tournamentRegistrationsTable.modality_id,
            })
                .from(schema_1.usersTable)
                .innerJoin(schema_1.tournamentRegistrationsTable, (0, drizzle_orm_1.eq)(schema_1.usersTable.id, schema_1.tournamentRegistrationsTable.athlete_id))
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.tournamentRegistrationsTable.modality_id, modalityId), (0, drizzle_orm_1.eq)(schema_1.usersTable.school_id, schoolId), (0, drizzle_orm_1.sql) `${schema_1.usersTable.roles_ids} @> ${JSON.stringify([constants_1.ROL_ALUMNO])}::jsonb`));
            return athletes;
        }
        catch (error) {
            this.logger.error('Error al obtener atletas inscritos:', error);
            throw new common_1.InternalServerErrorException('No se pudieron obtener los atletas inscritos.');
        }
    }
    async getSchoolsByDivision(modalityId) {
        try {
            const result = await this.db
                .select({
                schoolId: schema_1.schoolTable.id,
                schoolName: schema_1.schoolTable.name,
                schoolLogo: schema_1.schoolTable.logo_url,
                athleteCount: (0, drizzle_orm_1.sql) `count(${schema_1.usersTable.id})`
            })
                .from(schema_1.tournamentRegistrationsTable)
                .innerJoin(schema_1.usersTable, (0, drizzle_orm_1.eq)(schema_1.tournamentRegistrationsTable.athlete_id, schema_1.usersTable.id))
                .innerJoin(schema_1.schoolTable, (0, drizzle_orm_1.eq)(schema_1.usersTable.school_id, schema_1.schoolTable.id))
                .where((0, drizzle_orm_1.eq)(schema_1.tournamentRegistrationsTable.modality_id, modalityId))
                .groupBy(schema_1.schoolTable.id, schema_1.schoolTable.name, schema_1.schoolTable.logo_url);
            return result;
        }
        catch (error) {
            this.logger.error('Error al obtener escuelas de la modalidad:', error);
            throw new common_1.InternalServerErrorException('Error al procesar la lista de escuelas.');
        }
    }
    async getEventsWithEnrollmentStatus(athleteId, query) {
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
                    .leftJoin(schema_1.tournamentRegistrationsTable, (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.tournamentRegistrationsTable.event_id, schema_1.eventsTable.id), (0, drizzle_orm_1.eq)(schema_1.tournamentRegistrationsTable.athlete_id, athleteId)))
                    .where(finalWhere),
                this.db
                    .select({
                    eventId: schema_1.eventsTable.id,
                    eventName: schema_1.eventsTable.name,
                    eventDate: schema_1.eventsTable.date,
                    type_id: schema_1.subtypesEventsTable.type_id,
                    type: schema_1.typesEventsTable.type,
                    subtype: schema_1.subtypesEventsTable.subtype,
                    status_id: schema_1.eventsTable.status_id,
                    status: schema_1.statusTable.status,
                    category_id: schema_1.tournamentRegistrationsTable.category_id,
                    modality_id: schema_1.tournamentRegistrationsTable.modality_id,
                    enrollmentStatus: (0, drizzle_orm_1.sql) `COALESCE(${schema_1.tournamentRegistrationsTable.status}, 'No inscrito')`,
                    paymentStatus: (0, drizzle_orm_1.sql) `COALESCE(${schema_1.tournamentRegistrationsTable.payment_status}, 'Pendiente por pagar')`,
                })
                    .from(schema_1.eventsTable)
                    .leftJoin(schema_1.subtypesEventsTable, (0, drizzle_orm_1.eq)(schema_1.eventsTable.subtype_id, schema_1.subtypesEventsTable.id))
                    .leftJoin(schema_1.typesEventsTable, (0, drizzle_orm_1.eq)(schema_1.subtypesEventsTable.type_id, schema_1.typesEventsTable.id))
                    .leftJoin(schema_1.statusTable, (0, drizzle_orm_1.eq)(schema_1.eventsTable.status_id, schema_1.statusTable.id))
                    .leftJoin(schema_1.tournamentRegistrationsTable, (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.tournamentRegistrationsTable.event_id, schema_1.eventsTable.id), (0, drizzle_orm_1.eq)(schema_1.tournamentRegistrationsTable.athlete_id, athleteId)))
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
            this.logger.error('Error en getEventsWithEnrollmentStatus:', error);
            throw new common_1.InternalServerErrorException('Error al obtener los eventos disponibles.');
        }
    }
    async createParticipationRequest(athleteId, eventId) {
        console.log("llego aqui");
        try {
            const [event] = await this.db
                .select()
                .from(schema_1.eventsTable)
                .where((0, drizzle_orm_1.eq)(schema_1.eventsTable.id, eventId))
                .limit(1);
            if (!event) {
                throw new common_1.NotFoundException('El evento seleccionado no existe.');
            }
            const [existingReg] = await this.db
                .select()
                .from(schema_1.tournamentRegistrationsTable)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.tournamentRegistrationsTable.athlete_id, athleteId), (0, drizzle_orm_1.eq)(schema_1.tournamentRegistrationsTable.event_id, eventId)))
                .limit(1);
            if (existingReg) {
                throw new common_1.BadRequestException('Ya tienes una solicitud de participación/pre-inscripción para este torneo.');
            }
            const [newRegistration] = await this.db
                .insert(schema_1.tournamentRegistrationsTable)
                .values({
                athlete_id: athleteId,
                event_id: eventId,
                category_id: null,
                modality_id: null,
                status: 'Solicitud Pendiente',
                payment_status: 'Pendiente por pagar',
                registration_date: new Date(),
                created_at: new Date(),
                updated_at: new Date(),
            })
                .returning();
            if (newRegistration) {
                const [alumno] = await this.db.select({ name: schema_1.usersTable.name, lastname: schema_1.usersTable.lastname }).from(schema_1.usersTable).where((0, drizzle_orm_1.eq)(schema_1.usersTable.id, athleteId));
                await this.db.insert(schema_1.notificationsTable).values({
                    sender_id: athleteId,
                    recipient_id: event.created_by,
                    event_id: event.id,
                    title: 'Solicitud de pre-inscripción',
                    message: `${alumno.name} ${alumno.lastname}, desea participar en el torneo ${event.id}.`,
                });
            }
            return {
                success: true,
                message: 'Solicitud de participación/pre-inscripción al torneo creada. Espera a que el Master apruebe tu solicitud.',
                data: newRegistration,
            };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException || error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error('Error en createParticipationRequest:', error);
            throw new common_1.InternalServerErrorException('Error al crear la solicitud de participación/pre-inscripción al torneo.');
        }
    }
    async completeRegistrationByMaster(registrationId, masterId, categoryId, modalityId) {
        try {
            const [registration] = await this.db
                .select()
                .from(schema_1.tournamentRegistrationsTable)
                .where((0, drizzle_orm_1.eq)(schema_1.tournamentRegistrationsTable.id, registrationId))
                .limit(1);
            if (!registration) {
                throw new common_1.NotFoundException('Inscripción no encontrada.');
            }
            if (registration.status !== 'pendiente') {
                throw new common_1.BadRequestException(`No puedes completar una inscripción en estado "${registration.status}".`);
            }
            const [event] = await this.db
                .select()
                .from(schema_1.eventsTable)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.eventsTable.id, registration.event_id), (0, drizzle_orm_1.eq)(schema_1.eventsTable.created_by, masterId)))
                .limit(1);
            if (!event) {
                throw new common_1.NotFoundException('No tienes permiso para completar inscripciones de este evento.');
            }
            const [category] = await this.db
                .select()
                .from(schema_1.karateCategoriesTable)
                .where((0, drizzle_orm_1.eq)(schema_1.karateCategoriesTable.id, categoryId))
                .limit(1);
            if (!category) {
                throw new common_1.NotFoundException('La categoría seleccionada no existe.');
            }
            const [modality] = await this.db
                .select()
                .from(schema_1.modalitiesTable)
                .where((0, drizzle_orm_1.eq)(schema_1.modalitiesTable.id, modalityId))
                .limit(1);
            if (!modality) {
                throw new common_1.NotFoundException('La modalidad seleccionada no existe.');
            }
            const [updated] = await this.db
                .update(schema_1.tournamentRegistrationsTable)
                .set({
                category_id: categoryId,
                modality_id: modalityId,
                master_validation_date: new Date(),
                updated_at: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema_1.tournamentRegistrationsTable.id, registrationId))
                .returning();
            return {
                success: true,
                message: 'Inscripción completada. Ahora el alumno debe subir su comprobante de pago.',
                data: updated,
            };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException || error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error('Error en completeRegistrationByMaster:', error);
            throw new common_1.InternalServerErrorException('Error al completar la inscripción.');
        }
    }
    async getEventRegistrations(eventId, masterId) {
        try {
            const [event] = await this.db
                .select()
                .from(schema_1.eventsTable)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.eventsTable.id, eventId), (0, drizzle_orm_1.eq)(schema_1.eventsTable.created_by, masterId)))
                .limit(1);
            if (!event) {
                throw new common_1.NotFoundException('No tienes permiso para ver las inscripciones de este evento.');
            }
            const registrations = await this.db
                .select({
                id: schema_1.tournamentRegistrationsTable.id,
                athleteId: schema_1.tournamentRegistrationsTable.athlete_id,
                athleteName: (0, drizzle_orm_1.sql) `CONCAT(${schema_1.usersTable.name}, ' ', ${schema_1.usersTable.lastname})`,
                athleteEmail: schema_1.usersTable.email,
                categoryId: schema_1.tournamentRegistrationsTable.category_id,
                modalityId: schema_1.tournamentRegistrationsTable.modality_id,
                status: schema_1.tournamentRegistrationsTable.status,
                paymentStatus: schema_1.tournamentRegistrationsTable.payment_status,
                paymentMethod: schema_1.tournamentRegistrationsTable.payment_method,
                paymentProofUrl: schema_1.tournamentRegistrationsTable.payment_proof_url,
                registrationDate: schema_1.tournamentRegistrationsTable.registration_date,
                masterValidationDate: schema_1.tournamentRegistrationsTable.master_validation_date,
                rejectionReason: schema_1.tournamentRegistrationsTable.rejection_reason,
            })
                .from(schema_1.tournamentRegistrationsTable)
                .leftJoin(schema_1.usersTable, (0, drizzle_orm_1.eq)(schema_1.tournamentRegistrationsTable.athlete_id, schema_1.usersTable.id))
                .where((0, drizzle_orm_1.eq)(schema_1.tournamentRegistrationsTable.event_id, eventId));
            return {
                success: true,
                eventId,
                totalRegistrations: registrations.length,
                data: registrations,
            };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException || error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error('Error en getEventRegistrations:', error);
            throw new common_1.InternalServerErrorException('Error al obtener las inscripciones del evento.');
        }
    }
    async uploadPaymentProof(registrationId, athleteId, paymentMethod, paymentReference, paymentProofUrl) {
        try {
            const [registration] = await this.db
                .select()
                .from(schema_1.tournamentRegistrationsTable)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.tournamentRegistrationsTable.id, registrationId), (0, drizzle_orm_1.eq)(schema_1.tournamentRegistrationsTable.athlete_id, athleteId)))
                .limit(1);
            if (!registration) {
                throw new common_1.NotFoundException('Inscripción no encontrada o no tienes permiso para modificarla.');
            }
            if (!['pendiente', 'en_espera'].includes(registration.status)) {
                throw new common_1.BadRequestException(`No puedes subir pago para una inscripción en estado "${registration.status}".`);
            }
            const [updated] = await this.db
                .update(schema_1.tournamentRegistrationsTable)
                .set({
                payment_method: paymentMethod,
                payment_reference: paymentReference,
                payment_proof_url: paymentProofUrl || null,
                payment_date: new Date(),
                payment_status: 'en_espera',
                updated_at: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema_1.tournamentRegistrationsTable.id, registrationId))
                .returning();
            return {
                success: true,
                message: 'Comprobante de pago cargado. Espera la validación del administrador.',
                data: updated,
            };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException || error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error('Error en uploadPaymentProof:', error);
            throw new common_1.InternalServerErrorException('Error al cargar el comprobante de pago.');
        }
    }
    async validateRegistration(registrationId, masterId) {
        try {
            const [registration] = await this.db
                .select()
                .from(schema_1.tournamentRegistrationsTable)
                .where((0, drizzle_orm_1.eq)(schema_1.tournamentRegistrationsTable.id, registrationId))
                .limit(1);
            if (!registration) {
                throw new common_1.NotFoundException('Inscripción no encontrada.');
            }
            const [event] = await this.db
                .select()
                .from(schema_1.eventsTable)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.eventsTable.id, registration.event_id), (0, drizzle_orm_1.eq)(schema_1.eventsTable.created_by, masterId)))
                .limit(1);
            if (!event) {
                throw new common_1.NotFoundException('No tienes permiso para validar inscripciones de este evento.');
            }
            const [updated] = await this.db
                .update(schema_1.tournamentRegistrationsTable)
                .set({
                status: 'validado',
                master_id: masterId,
                master_validation_date: new Date(),
                updated_at: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema_1.tournamentRegistrationsTable.id, registrationId))
                .returning();
            return {
                success: true,
                message: 'Inscripción validada exitosamente.',
                data: updated,
            };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException || error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error('Error en validateRegistration:', error);
            throw new common_1.InternalServerErrorException('Error al validar la inscripción.');
        }
    }
    async validatePayment(registrationId, masterId) {
        try {
            const [registration] = await this.db
                .select()
                .from(schema_1.tournamentRegistrationsTable)
                .where((0, drizzle_orm_1.eq)(schema_1.tournamentRegistrationsTable.id, registrationId))
                .limit(1);
            if (!registration) {
                throw new common_1.NotFoundException('Inscripción no encontrada.');
            }
            const [event] = await this.db
                .select()
                .from(schema_1.eventsTable)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.eventsTable.id, registration.event_id), (0, drizzle_orm_1.eq)(schema_1.eventsTable.created_by, masterId)))
                .limit(1);
            if (!event) {
                throw new common_1.NotFoundException('No tienes permiso para validar pagos de este evento.');
            }
            const [updated] = await this.db
                .update(schema_1.tournamentRegistrationsTable)
                .set({
                payment_status: 'pagado',
                master_id: masterId,
                master_validation_date: new Date(),
                updated_at: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema_1.tournamentRegistrationsTable.id, registrationId))
                .returning();
            return {
                success: true,
                message: 'Pago validado exitosamente.',
                data: updated,
            };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException || error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error('Error en validatePayment:', error);
            throw new common_1.InternalServerErrorException('Error al validar el pago.');
        }
    }
    async rejectRegistration(registrationId, masterId, rejectionReason) {
        try {
            const [registration] = await this.db
                .select()
                .from(schema_1.tournamentRegistrationsTable)
                .where((0, drizzle_orm_1.eq)(schema_1.tournamentRegistrationsTable.id, registrationId))
                .limit(1);
            if (!registration) {
                throw new common_1.NotFoundException('Inscripción no encontrada.');
            }
            if (registration.payment_status === 'pagado') {
                throw new common_1.BadRequestException('No puedes rechazar una inscripción que ya ha sido pagada.');
            }
            const [event] = await this.db
                .select()
                .from(schema_1.eventsTable)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.eventsTable.id, registration.event_id), (0, drizzle_orm_1.eq)(schema_1.eventsTable.created_by, masterId)))
                .limit(1);
            if (!event) {
                throw new common_1.NotFoundException('No tienes permiso para rechazar inscripciones de este evento.');
            }
            const [updated] = await this.db
                .update(schema_1.tournamentRegistrationsTable)
                .set({
                status: 'rechazado',
                rejection_reason: rejectionReason,
                master_id: masterId,
                master_validation_date: new Date(),
                updated_at: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema_1.tournamentRegistrationsTable.id, registrationId))
                .returning();
            return {
                success: true,
                message: 'Inscripción rechazada exitosamente.',
                data: updated,
            };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException || error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error('Error en rejectRegistration:', error);
            throw new common_1.InternalServerErrorException('Error al rechazar la inscripción.');
        }
    }
};
exports.TournamentRegistrationsService = TournamentRegistrationsService;
exports.TournamentRegistrationsService = TournamentRegistrationsService = TournamentRegistrationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(constants_1.PG_CONNECTION)),
    __metadata("design:paramtypes", [neon_serverless_1.NeonDatabase])
], TournamentRegistrationsService);
//# sourceMappingURL=tournament-registrations.service.js.map