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
exports.ModalitiesService = void 0;
const common_1 = require("@nestjs/common");
const constants_1 = require("../constants");
const neon_serverless_1 = require("drizzle-orm/neon-serverless");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
let ModalitiesService = class ModalitiesService {
    constructor(db) {
        this.db = db;
    }
    async create(dto) {
        try {
            const existing = await this.db
                .select()
                .from(schema_1.modalitiesTable)
                .where((0, drizzle_orm_1.eq)(schema_1.modalitiesTable.name, dto.name))
                .limit(1);
            if (existing.length > 0) {
                throw new common_1.BadRequestException(`La modalidad '${dto.name}' ya existe.`);
            }
            const result = await this.db
                .insert(schema_1.modalitiesTable)
                .values({
                name: dto.name,
                type: dto.type,
            })
                .returning();
            return result[0];
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException)
                throw error;
            throw new common_1.BadRequestException('Error al crear la modalidad: ' + error.message);
        }
    }
    async findAll() {
        return await this.db
            .select({
            id: schema_1.modalitiesTable.id,
            name: schema_1.modalitiesTable.name,
            type: schema_1.modalitiesTable.type,
        })
            .from(schema_1.modalitiesTable);
    }
};
exports.ModalitiesService = ModalitiesService;
exports.ModalitiesService = ModalitiesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(constants_1.PG_CONNECTION)),
    __metadata("design:paramtypes", [neon_serverless_1.NeonDatabase])
], ModalitiesService);
//# sourceMappingURL=modalities.service.js.map