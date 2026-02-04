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
    async findAll() {
        try {
            const belts = await this.db
                .select()
                .from(schema_1.karateBeltsTable)
                .orderBy((0, drizzle_orm_1.asc)(schema_1.karateBeltsTable.id));
            return {
                data: belts
            };
        }
        catch (error) {
            console.error("Error Karate Belts Service:", error);
            throw new common_1.InternalServerErrorException("No se pudo obtener el listado de cinturones.");
        }
    }
    async create(createDto) {
        try {
            const [newBelt] = await this.db
                .insert(schema_1.karateBeltsTable)
                .values(createDto)
                .returning();
            return { message: 'Cinturón creado correctamente', data: newBelt };
        }
        catch (error) {
            if (error.code === '23505') {
                throw new common_1.ConflictException('El nombre o el orden de rango ya existen.');
            }
            throw new common_1.InternalServerErrorException('Error al crear el cinturón.');
        }
    }
    async update(id, updateDto) {
        try {
            const [updatedBelt] = await this.db
                .update(schema_1.karateBeltsTable)
                .set(updateDto)
                .where((0, drizzle_orm_1.eq)(schema_1.karateBeltsTable.id, id))
                .returning();
            if (!updatedBelt) {
                throw new common_1.NotFoundException(`Cinturón con ID ${id} no encontrado.`);
            }
            return { message: 'Cinturón actualizado correctamente', data: updatedBelt };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException)
                throw error;
            if (error.code === '23505') {
                throw new common_1.ConflictException('El nombre o rango ya están en uso por otro cinturón.');
            }
            throw new common_1.InternalServerErrorException('Error al actualizar el cinturón.');
        }
    }
    async remove(id) {
        try {
            const [deletedBelt] = await this.db
                .delete(schema_1.karateBeltsTable)
                .where((0, drizzle_orm_1.eq)(schema_1.karateBeltsTable.id, id))
                .returning();
            if (!deletedBelt) {
                throw new common_1.NotFoundException(`No se encontró el cinturón con ID ${id} para eliminar.`);
            }
            return {
                message: 'Cinturón eliminado exitosamente.',
                data: deletedBelt,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException)
                throw error;
            if (error.code === '23503') {
                throw new common_1.ConflictException('No se puede eliminar el cinturón porque hay alumnos asociados a él.');
            }
            console.error(error);
            throw new common_1.InternalServerErrorException('Error al eliminar el cinturón de la base de datos.');
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