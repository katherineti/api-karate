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
    async getEventCategoriesSummary(eventId) {
        const rows = await this.db.select({
            event_id: schema_1.eventDivisionsTable.event_id,
            category_id: schema_1.karateCategoriesTable.id,
            category_name: schema_1.karateCategoriesTable.category,
            age_range: schema_1.karateCategoriesTable.age_range,
            allowed_belts_ids: schema_1.karateCategoriesTable.allowed_belts,
            kata_count: (0, drizzle_orm_1.sql) `count(*) filter (where ${schema_1.modalitiesTable.type} = 'kata')`.mapWith(Number),
            combate_count: (0, drizzle_orm_1.sql) `count(*) filter (where ${schema_1.modalitiesTable.type} = 'combate')`.mapWith(Number),
            total_modalities: (0, drizzle_orm_1.sql) `count(${schema_1.eventDivisionsTable.id})`.mapWith(Number),
        })
            .from(schema_1.eventDivisionsTable)
            .innerJoin(schema_1.karateCategoriesTable, (0, drizzle_orm_1.eq)(schema_1.eventDivisionsTable.category_id, schema_1.karateCategoriesTable.id))
            .innerJoin(schema_1.modalitiesTable, (0, drizzle_orm_1.eq)(schema_1.eventDivisionsTable.modality_id, schema_1.modalitiesTable.id))
            .where((0, drizzle_orm_1.eq)(schema_1.eventDivisionsTable.event_id, eventId))
            .groupBy(schema_1.eventDivisionsTable.event_id, schema_1.karateCategoriesTable.id, schema_1.karateCategoriesTable.category, schema_1.karateCategoriesTable.age_range);
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
    }
    async getCategoriesByEvent(eventId) {
        const rows = await this.db.select({
            id: schema_1.eventDivisionsTable.id,
            category_id: schema_1.eventDivisionsTable.category_id,
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
            .where((0, drizzle_orm_1.eq)(schema_1.eventDivisionsTable.event_id, eventId))
            .orderBy(schema_1.eventDivisionsTable.id);
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
    async toggleCategoryStatusInEvent(eventId, categoryId, active) {
        const result = await this.db
            .update(schema_1.eventDivisionsTable)
            .set({
            is_active: active,
            updated_at: new Date()
        })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.eventDivisionsTable.event_id, eventId), (0, drizzle_orm_1.eq)(schema_1.eventDivisionsTable.category_id, categoryId)))
            .returning();
        if (result.length === 0) {
            throw new common_1.BadRequestException('No se encontraron divisiones para esa combinación de evento y categoría.');
        }
        return result;
    }
    async toggleModalityConfig(dto) {
        try {
            const values = {
                event_id: dto.event_id,
                category_id: dto.category_id,
                modality_id: dto.modality_id,
                is_active: dto.is_active,
                max_evaluation_score: 0,
            };
            const result = await this.db.insert(schema_1.eventDivisionsTable)
                .values(values)
                .onConflictDoUpdate({
                target: [
                    schema_1.eventDivisionsTable.event_id,
                    schema_1.eventDivisionsTable.category_id,
                    schema_1.eventDivisionsTable.modality_id,
                ],
                set: {
                    is_active: dto.is_active,
                    updated_at: new Date(),
                },
            })
                .returning();
            return result[0];
        }
        catch (error) {
            throw new common_1.BadRequestException('No se pudo procesar la configuración de la modalidad: ' + error.message);
        }
    }
    async getModalitiesByEventCategory(eventId, categoryId) {
        const divisions = await this.db.select({
            division_id: schema_1.eventDivisionsTable.id,
            modality_id: schema_1.modalitiesTable.id,
            modality_name: schema_1.modalitiesTable.name,
            modality_type: schema_1.modalitiesTable.type,
            is_active: schema_1.eventDivisionsTable.is_active,
        })
            .from(schema_1.eventDivisionsTable)
            .innerJoin(schema_1.modalitiesTable, (0, drizzle_orm_1.eq)(schema_1.eventDivisionsTable.modality_id, schema_1.modalitiesTable.id))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.eventDivisionsTable.event_id, eventId), (0, drizzle_orm_1.eq)(schema_1.eventDivisionsTable.category_id, categoryId)));
        if (divisions.length === 0)
            return [];
        const divisionIds = divisions.map(d => d.division_id);
        const allJudges = await this.db.select({
            division_id: schema_1.divisionJudgesTable.division_id,
            judge_id: schema_1.usersTable.id,
            judge_name: schema_1.usersTable.name,
            judge_lastname: schema_1.usersTable.lastname,
            judge_email: schema_1.usersTable.email,
            role: schema_1.divisionJudgesTable.role_in_pool
        })
            .from(schema_1.divisionJudgesTable)
            .innerJoin(schema_1.usersTable, (0, drizzle_orm_1.eq)(schema_1.divisionJudgesTable.judge_id, schema_1.usersTable.id))
            .where((0, drizzle_orm_1.inArray)(schema_1.divisionJudgesTable.division_id, divisionIds));
        return divisions.map(division => ({
            ...division,
            assigned_judges: allJudges
                .filter(j => j.division_id === division.division_id)
                .map(j => ({
                id: j.judge_id,
                name: j.judge_name,
                lastname: j.judge_lastname,
                email: j.judge_email,
                role: j.role
            }))
        }));
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