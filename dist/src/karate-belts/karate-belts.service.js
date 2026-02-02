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
exports.KarateBeltsService = void 0;
const common_1 = require("@nestjs/common");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const constants_1 = require("../constants");
const neon_serverless_1 = require("drizzle-orm/neon-serverless");
let KarateBeltsService = class KarateBeltsService {
    constructor(db) {
        this.db = db;
    }
    async findAllPaginated(payload) {
        const { page, limit, search } = payload;
        const offset = (page - 1) * limit;
        try {
            const whereCondition = search ? (0, drizzle_orm_1.ilike)(schema_1.karateBeltsTable.belt, `%${search}%`) : undefined;
            const belts = await this.db
                .select()
                .from(schema_1.karateBeltsTable)
                .where(whereCondition)
                .orderBy((0, drizzle_orm_1.asc)(schema_1.karateBeltsTable.id))
                .limit(limit)
                .offset(offset);
            const [totalCount] = await this.db
                .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
                .from(schema_1.karateBeltsTable)
                .where(whereCondition);
            const total = Number(totalCount.count);
            return {
                data: belts,
                meta: {
                    total,
                    page,
                    lastPage: Math.ceil(total / limit),
                }
            };
        }
        catch (error) {
            console.error("Error Karate Belts Service:", error);
            throw new common_1.InternalServerErrorException("No se pudo obtener el listado de cinturones.");
        }
    }
};
exports.KarateBeltsService = KarateBeltsService;
exports.KarateBeltsService = KarateBeltsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(constants_1.PG_CONNECTION)),
    __metadata("design:paramtypes", [neon_serverless_1.NeonDatabase])
], KarateBeltsService);
//# sourceMappingURL=karate-belts.service.js.map