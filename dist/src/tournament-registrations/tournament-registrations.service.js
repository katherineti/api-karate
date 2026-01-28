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
exports.TournamentRegistrationsService = void 0;
const common_1 = require("@nestjs/common");
const constants_1 = require("../constants");
const neon_serverless_1 = require("drizzle-orm/neon-serverless");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
let TournamentRegistrationsService = class TournamentRegistrationsService {
    constructor(db) {
        this.db = db;
    }
    async bulkRegisterAthletes(dto) {
        return await this.db.transaction(async (tx) => {
            const [divisionInfo] = await tx
                .select({
                eventId: schema_1.eventCategoriesTable.event_id,
            })
                .from(schema_1.eventDivisionsTable)
                .innerJoin(schema_1.eventCategoriesTable, (0, drizzle_orm_1.eq)(schema_1.eventDivisionsTable.event_category_id, schema_1.eventCategoriesTable.id))
                .where((0, drizzle_orm_1.eq)(schema_1.eventDivisionsTable.id, dto.division_id))
                .limit(1);
            if (!divisionInfo) {
                throw new common_1.NotFoundException('La división seleccionada no existe o no está configurada.');
            }
            const targetEventId = divisionInfo.eventId;
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
                .innerJoin(schema_1.eventDivisionsTable, (0, drizzle_orm_1.eq)(schema_1.tournamentRegistrationsTable.division_id, schema_1.eventDivisionsTable.id))
                .innerJoin(schema_1.eventCategoriesTable, (0, drizzle_orm_1.eq)(schema_1.eventDivisionsTable.event_category_id, schema_1.eventCategoriesTable.id))
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.eventCategoriesTable.event_id, targetEventId), (0, drizzle_orm_1.sql) `${schema_1.tournamentRegistrationsTable.athlete_id} IN (
          SELECT id FROM users WHERE school_id = ${dto.school_id}
        )`));
            const inscritosActuales = Number(currentInscriptions[0].totalInscritos);
            if (inscritosActuales + dto.athlete_ids.length > limitAllowed) {
                throw new common_1.BadRequestException(`Cupo insuficiente para el evento. Tienes ${inscritosActuales} inscritos de ${limitAllowed} permitidos.`);
            }
            const dataToInsert = dto.athlete_ids.map(athleteId => ({
                athlete_id: athleteId,
                division_id: dto.division_id,
                status: 'confirmado',
            }));
            try {
                await tx.insert(schema_1.tournamentRegistrationsTable).values(dataToInsert);
            }
            catch (error) {
                if (error.code === '23505') {
                    throw new common_1.BadRequestException('Uno o más atletas ya están inscritos en esta misma modalidad y categoría.');
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
};
exports.TournamentRegistrationsService = TournamentRegistrationsService;
exports.TournamentRegistrationsService = TournamentRegistrationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(constants_1.PG_CONNECTION)),
    __metadata("design:paramtypes", [neon_serverless_1.NeonDatabase])
], TournamentRegistrationsService);
//# sourceMappingURL=tournament-registrations.service.js.map