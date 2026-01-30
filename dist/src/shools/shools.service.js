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
exports.ShoolsService = void 0;
const common_1 = require("@nestjs/common");
const constants_1 = require("../constants");
const neon_serverless_1 = require("drizzle-orm/neon-serverless");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
let ShoolsService = class ShoolsService {
    constructor(db) {
        this.db = db;
    }
    async getAll() {
        try {
            const result = await this.db.select({
                id: schema_1.schoolTable.id,
                name: schema_1.schoolTable.name,
                slug: schema_1.schoolTable.slug
            }).from(schema_1.schoolTable);
            return result || null;
        }
        catch (err) {
            console.error("Error en la base de datos al buscar las escuelas: ", err);
            throw new Error("Error al obtener las escuelas " + err);
        }
    }
    async getById(id) {
        try {
            const result = await this.db.select({ id: schema_1.schoolTable.id })
                .from(schema_1.schoolTable)
                .where((0, drizzle_orm_1.eq)(schema_1.schoolTable.id, id));
            return result[0] || null;
        }
        catch (err) {
            console.error("Error en la base de datos al buscar el usuario " + id + ": ", err);
            throw new Error("Error al obtener el usuario " + id + " " + err);
        }
    }
    generateSlug(name) {
        return name
            .toLowerCase()
            .trim()
            .normalize('NFD')
            .replaceAll(/[\u0300-\u036f]/g, '')
            .replaceAll(/[^a-z0-9\s-]/g, '')
            .replaceAll(/\s+/g, '-')
            .replaceAll(/-+/g, '-');
    }
    async create(dto) {
        try {
            const slug = this.generateSlug(dto.name);
            const [newSchool] = await this.db
                .insert(schema_1.schoolTable)
                .values({
                name: dto.name,
                slug: slug,
                address: dto.address,
                base_score: dto.base_score ?? 0,
            })
                .returning();
            return newSchool;
        }
        catch (error) {
            if (error.code === '23505')
                throw new common_1.ConflictException('Nombre duplicado');
            throw new common_1.InternalServerErrorException('Error al crear escuela');
        }
    }
    async findAllPaginated(payload) {
        const { page, limit, search } = payload;
        const offset = (page - 1) * limit;
        try {
            const whereCondition = search ? (0, drizzle_orm_1.ilike)(schema_1.schoolTable.name, `%${search}%`) : undefined;
            const schools = await this.db
                .select({
                id: schema_1.schoolTable.id,
                name: schema_1.schoolTable.name,
                slug: schema_1.schoolTable.slug,
                address: schema_1.schoolTable.address,
                base_score: schema_1.schoolTable.base_score,
                is_active: schema_1.schoolTable.is_active,
                masters: (0, drizzle_orm_1.sql) `json_agg(
            json_build_object(
              'id', ${schema_1.usersTable.id},
              'fullname', concat(${schema_1.usersTable.name}, ' ', ${schema_1.usersTable.lastname}),
              'email', ${schema_1.usersTable.email}
            )
          ) filter (where ${schema_1.usersTable.id} is not null)`
            })
                .from(schema_1.schoolTable)
                .leftJoin(schema_1.usersTable, (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.schoolTable.id, schema_1.usersTable.school_id), (0, drizzle_orm_1.sql) `${schema_1.usersTable.roles_ids} @> ${JSON.stringify([constants_1.ROL_MASTER])}::jsonb`))
                .where(whereCondition)
                .groupBy(schema_1.schoolTable.id)
                .limit(limit)
                .offset(offset);
            const [totalCount] = await this.db
                .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
                .from(schema_1.schoolTable)
                .where(whereCondition);
            const total = Number(totalCount.count);
            return {
                data: schools.map(s => ({ ...s, masters: s.masters || [] })),
                meta: {
                    total,
                    page,
                    lastPage: Math.ceil(total / limit),
                }
            };
        }
        catch (error) {
            console.error("Error Schools Service:", error);
            throw new common_1.InternalServerErrorException("No se pudo obtener el listado de escuelas.");
        }
    }
    async update(id, dto) {
        try {
            const updateData = {
                ...dto,
                updated_at: new Date()
            };
            if (dto.name) {
                updateData.slug = this.generateSlug(dto.name);
            }
            const [updatedSchool] = await this.db
                .update(schema_1.schoolTable)
                .set(updateData)
                .where((0, drizzle_orm_1.eq)(schema_1.schoolTable.id, id))
                .returning();
            if (!updatedSchool) {
                throw new common_1.NotFoundException(`No se encontró la escuela con ID ${id}`);
            }
            return updatedSchool;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException)
                throw error;
            if (error.code === '23505') {
                throw new common_1.ConflictException('El nuevo nombre de escuela ya está en uso.');
            }
            console.error('ERROR_UPDATE_SCHOOL:', error);
            throw new common_1.InternalServerErrorException('Error al actualizar la escuela.');
        }
    }
    async remove(id) {
        try {
            const [deletedSchool] = await this.db
                .delete(schema_1.schoolTable)
                .where((0, drizzle_orm_1.eq)(schema_1.schoolTable.id, id))
                .returning();
            if (!deletedSchool) {
                throw new common_1.NotFoundException(`No se encontró la escuela con ID ${id} para eliminar.`);
            }
            return { message: 'Escuela eliminada permanentemente.', data: deletedSchool };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException)
                throw error;
            throw new common_1.InternalServerErrorException('Error al eliminar la escuela de la base de datos.');
        }
    }
    async changeStatus(id, isActive) {
        try {
            const [updatedSchool] = await this.db
                .update(schema_1.schoolTable)
                .set({ is_active: isActive })
                .where((0, drizzle_orm_1.eq)(schema_1.schoolTable.id, id))
                .returning();
            if (!updatedSchool) {
                throw new common_1.NotFoundException(`No se encontró la escuela con ID ${id}.`);
            }
            const statusMsg = isActive ? 'habilitada' : 'inhabilitada';
            return { message: `Escuela ${statusMsg} correctamente.`, data: updatedSchool };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException)
                throw error;
            throw new common_1.InternalServerErrorException('Error al cambiar el estado de la escuela.');
        }
    }
};
exports.ShoolsService = ShoolsService;
exports.ShoolsService = ShoolsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(constants_1.PG_CONNECTION)),
    __metadata("design:paramtypes", [neon_serverless_1.NeonDatabase])
], ShoolsService);
//# sourceMappingURL=shools.service.js.map