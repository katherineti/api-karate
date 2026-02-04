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
            const values = {
                name: dto.name,
                type: dto.type,
                style: dto.style || null,
                description: dto.description || null,
            };
            const result = await this.db
                .insert(schema_1.modalitiesTable)
                .values(values)
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
    async findAllPaginated(payload) {
        const { page, limit, search, type } = payload;
        const offset = (page - 1) * limit;
        try {
            const filters = [];
            if (search) {
                filters.push((0, drizzle_orm_1.ilike)(schema_1.modalitiesTable.name, `%${search}%`));
            }
            if (type) {
                filters.push((0, drizzle_orm_1.ilike)(schema_1.modalitiesTable.type, `%${type}%`));
            }
            const whereCondition = filters.length > 0 ? (0, drizzle_orm_1.and)(...filters) : undefined;
            const modalities = await this.db
                .select()
                .from(schema_1.modalitiesTable)
                .where(whereCondition)
                .orderBy((0, drizzle_orm_1.asc)(schema_1.modalitiesTable.id))
                .limit(limit)
                .offset(offset);
            const [totalCount] = await this.db
                .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
                .from(schema_1.modalitiesTable)
                .where(whereCondition);
            const total = Number(totalCount.count);
            return {
                data: modalities,
                meta: {
                    total,
                    page,
                    last_page: Math.ceil(total / limit),
                },
            };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Error al obtener modalidades paginadas');
        }
    }
    async update(id, dto) {
        try {
            const updateData = {
                ...(dto.name && { name: dto.name.trim() }),
                ...(dto.type && { type: dto.type.trim() }),
                ...(dto.style && { style: dto.style.trim() }),
                ...(dto.description && { description: dto.description.trim() }),
            };
            if (dto.type === 'combate') {
                updateData.style = null;
            }
            const [updatedModality] = await this.db
                .update(schema_1.modalitiesTable)
                .set(updateData)
                .where((0, drizzle_orm_1.eq)(schema_1.modalitiesTable.id, id))
                .returning();
            if (!updatedModality) {
                throw new common_1.NotFoundException(`La modalidad con ID ${id} no existe.`);
            }
            return {
                message: 'Modalidad actualizada correctamente',
                data: updatedModality,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException)
                throw error;
            if (error.code === '23505') {
                throw new common_1.ConflictException(`Ya existe otra modalidad con el nombre "${dto.name}".`);
            }
            throw new common_1.InternalServerErrorException('Error al actualizar la modalidad');
        }
    }
    async remove(id) {
        try {
            const [deletedModality] = await this.db
                .delete(schema_1.modalitiesTable)
                .where((0, drizzle_orm_1.eq)(schema_1.modalitiesTable.id, id))
                .returning();
            if (!deletedModality) {
                throw new common_1.NotFoundException(`No se encontró la modalidad con ID ${id} para eliminar.`);
            }
            return {
                message: 'Modalidad eliminada exitosamente.',
                data: deletedModality,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException)
                throw error;
            if (error.code === '23503') {
                throw new common_1.ConflictException('No se puede eliminar la modalidad porque ya está asignada a categorías o eventos existentes.');
            }
            throw new common_1.InternalServerErrorException('Error al eliminar la modalidad de la base de datos.');
        }
    }
};
exports.ModalitiesService = ModalitiesService;
exports.ModalitiesService = ModalitiesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(constants_1.PG_CONNECTION)),
    __metadata("design:paramtypes", [neon_serverless_1.NeonDatabase])
], ModalitiesService);
//# sourceMappingURL=modalities.service.js.map