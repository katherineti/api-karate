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
exports.EventConfigService = void 0;
const common_1 = require("@nestjs/common");
const constants_1 = require("../constants");
const neon_serverless_1 = require("drizzle-orm/neon-serverless");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
let EventConfigService = class EventConfigService {
    constructor(db) {
        this.db = db;
    }
    async setupDivision(dto) {
        try {
            const values = {
                event_id: dto.event_id,
                category_id: dto.category_id,
                modality_id: dto.modality_id,
                max_evaluation_score: dto.max_evaluation_score ?? 0,
                is_active: dto.is_active ?? true,
            };
            const result = await this.db.insert(schema_1.eventDivisionsTable)
                .values(values)
                .onConflictDoUpdate({
                target: [
                    schema_1.eventDivisionsTable.event_id,
                    schema_1.eventDivisionsTable.category_id,
                    schema_1.eventDivisionsTable.modality_id
                ],
                set: {
                    max_evaluation_score: dto.max_evaluation_score ?? 0,
                    is_active: dto.is_active ?? true,
                    updated_at: new Date()
                },
            })
                .returning();
            return result[0];
        }
        catch (error) {
            throw new common_1.BadRequestException('Error al configurar la división: ' + error.message);
        }
    }
    async getCategoriesByEvent(eventId) {
        const rows = await this.db.select({
            id: schema_1.eventDivisionsTable.id,
            category: schema_1.karateCategoriesTable.category,
            age_range: schema_1.karateCategoriesTable.age_range,
            allowed_belts_ids: schema_1.karateCategoriesTable.allowed_belts,
            modality: schema_1.modalitiesTable.name,
            max_score: schema_1.eventDivisionsTable.max_evaluation_score,
            is_active: schema_1.eventDivisionsTable.is_active
        })
            .from(schema_1.eventDivisionsTable)
            .innerJoin(schema_1.karateCategoriesTable, (0, drizzle_orm_1.eq)(schema_1.eventDivisionsTable.category_id, schema_1.karateCategoriesTable.id))
            .innerJoin(schema_1.modalitiesTable, (0, drizzle_orm_1.eq)(schema_1.eventDivisionsTable.modality_id, schema_1.modalitiesTable.id))
            .where((0, drizzle_orm_1.eq)(schema_1.eventDivisionsTable.event_id, eventId));
        if (rows.length === 0)
            return [];
        const allBelts = await this.db.select().from(schema_1.karateBeltsTable);
        return rows.map(row => {
            const detailedBelts = allBelts
                .filter(belt => row.allowed_belts_ids?.includes(belt.id))
                .map(belt => ({
                id: belt.id,
                name: belt.belt
            }));
            return {
                id: row.id,
                category: row.category,
                age_range: row.age_range,
                modality: row.modality,
                max_score: row.max_score,
                is_active: row.is_active,
                allowed_belts: detailedBelts
            };
        });
    }
    async removeDivision(divisionId) {
        return this.db.delete(schema_1.eventDivisionsTable)
            .where((0, drizzle_orm_1.eq)(schema_1.eventDivisionsTable.id, divisionId))
            .returning();
    }
};
exports.EventConfigService = EventConfigService;
exports.EventConfigService = EventConfigService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(constants_1.PG_CONNECTION)),
    __metadata("design:paramtypes", [neon_serverless_1.NeonDatabase])
], EventConfigService);
//# sourceMappingURL=event-config.service.js.map