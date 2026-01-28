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
exports.ParticipantRequestsService = void 0;
const common_1 = require("@nestjs/common");
const constants_1 = require("../../constants");
const neon_serverless_1 = require("drizzle-orm/neon-serverless");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../../db/schema");
let ParticipantRequestsService = class ParticipantRequestsService {
    constructor(db) {
        this.db = db;
    }
    async createParticipantRequest(dto, master_sender) {
        return await this.db.transaction(async (tx) => {
            const [event] = await tx
                .select({ creatorId: schema_1.eventsTable.created_by, name: schema_1.eventsTable.name })
                .from(schema_1.eventsTable)
                .where((0, drizzle_orm_1.eq)(schema_1.eventsTable.id, dto.event_id))
                .limit(1);
            if (!event)
                throw new common_1.NotFoundException('Evento no encontrado');
            const [data_master_sender] = await tx
                .select({ school_id: schema_1.usersTable.school_id, name: schema_1.usersTable.name, lastname: schema_1.usersTable.lastname, email: schema_1.usersTable.email })
                .from(schema_1.usersTable)
                .where((0, drizzle_orm_1.eq)(schema_1.usersTable.id, master_sender.sub))
                .limit(1);
            if (!data_master_sender)
                throw new common_1.NotFoundException('Responsable del evento no encontrado');
            console.log("master que envia la solicitud", data_master_sender);
            const [request] = await tx.insert(schema_1.participantRequestsTable).values({
                event_id: dto.event_id,
                master_id: master_sender.sub,
                school_id: data_master_sender.school_id,
                num_participants_requested: dto.num_participants_requested,
                message: 'Solicitud de ' + dto.num_participants_requested + ' participantes en el evento ' + dto.event_id,
                status: 'pending'
            }).returning();
            let name_master_send = data_master_sender.email;
            if (data_master_sender.name && data_master_sender.lastname) {
                name_master_send = data_master_sender.name + ' ' + data_master_sender.lastname;
            }
            else {
                name_master_send = data_master_sender.email;
            }
            await tx.insert(schema_1.notificationsTable).values({
                sender_id: master_sender.sub,
                recipient_id: event.creatorId,
                event_id: dto.event_id,
                participant_requests_id: request.id,
                title: 'Nueva solicitud de cupos',
                message: `El Master ${name_master_send} solicita ${dto.num_participants_requested} cupos para el evento ${event.name}`,
            });
            return { message: 'Solicitud enviada al responsable del evento', data: request };
        });
    }
    async approveRequest(requestId, adminId) {
        return await this.db.transaction(async (tx) => {
            const [requestData] = await tx
                .select({
                id: schema_1.participantRequestsTable.id,
                masterId: schema_1.participantRequestsTable.master_id,
                eventId: schema_1.participantRequestsTable.event_id,
                num: schema_1.participantRequestsTable.num_participants_requested,
                eventName: schema_1.eventsTable.name
            })
                .from(schema_1.participantRequestsTable)
                .innerJoin(schema_1.eventsTable, (0, drizzle_orm_1.eq)(schema_1.participantRequestsTable.event_id, schema_1.eventsTable.id))
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.participantRequestsTable.id, requestId), (0, drizzle_orm_1.eq)(schema_1.eventsTable.created_by, adminId)))
                .limit(1);
            if (!requestData) {
                throw new common_1.NotFoundException('Solicitud no encontrada o no tienes permisos sobre este evento');
            }
            await tx.update(schema_1.participantRequestsTable)
                .set({ status: 'approved' })
                .where((0, drizzle_orm_1.eq)(schema_1.participantRequestsTable.id, requestId));
            await tx.insert(schema_1.notificationsTable).values({
                sender_id: adminId,
                recipient_id: requestData.masterId,
                event_id: requestData.eventId,
                title: '✅ Solicitud de participantes aprobada',
                message: `Tu solicitud para llevar ${requestData.num} participantes al evento "${requestData.eventName}" ha sido APROBADA.`,
            });
            return { message: 'Solicitud aprobada y Master notificado' };
        });
    }
    async rejectRequest(requestId, adminId, reason) {
        return await this.db.transaction(async (tx) => {
            const [requestData] = await tx
                .select({
                id: schema_1.participantRequestsTable.id,
                masterId: schema_1.participantRequestsTable.master_id,
                eventId: schema_1.participantRequestsTable.event_id,
                eventName: schema_1.eventsTable.name
            })
                .from(schema_1.participantRequestsTable)
                .innerJoin(schema_1.eventsTable, (0, drizzle_orm_1.eq)(schema_1.participantRequestsTable.event_id, schema_1.eventsTable.id))
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.participantRequestsTable.id, requestId), (0, drizzle_orm_1.eq)(schema_1.eventsTable.created_by, adminId)))
                .limit(1);
            console.log("requestId", requestId, " , adminId ", adminId, " , reason ", reason);
            console.log("requestData", requestData);
            if (!requestData) {
                throw new common_1.ForbiddenException('No tienes permiso para gestionar esta solicitud porque no eres el creador de este evento.');
            }
            await tx.update(schema_1.participantRequestsTable)
                .set({ status: 'rejected' })
                .where((0, drizzle_orm_1.eq)(schema_1.participantRequestsTable.id, requestId));
            await tx.insert(schema_1.notificationsTable).values({
                sender_id: adminId,
                recipient_id: requestData.masterId,
                event_id: requestData.eventId,
                reference_id: requestData.id,
                title: '❌ Solicitud de participantes rechazada',
                message: `Tu solicitud para el evento "${requestData.eventName}" no fue aprobada. Motivo: ${reason}`,
            });
            return { message: 'Solicitud rechazada y Master notificado' };
        });
    }
};
exports.ParticipantRequestsService = ParticipantRequestsService;
exports.ParticipantRequestsService = ParticipantRequestsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(constants_1.PG_CONNECTION)),
    __metadata("design:paramtypes", [neon_serverless_1.NeonDatabase])
], ParticipantRequestsService);
//# sourceMappingURL=participantRequests.service.js.map