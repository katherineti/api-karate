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
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const constants_1 = require("../constants");
const neon_serverless_1 = require("drizzle-orm/neon-serverless");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
let CategoriesService = class CategoriesService {
    constructor(db) {
        this.db = db;
    }
    async create(dto) {
        try {
            const values = {
                category: dto.category.trim(),
                age_range: dto.age_range.trim(),
                allowed_belts: dto.allowed_belts || [],
            };
            const [newCategory] = await this.db.insert(schema_1.karateCategoriesTable)
                .values(values)
                .returning();
            return newCategory;
        }
        catch (error) {
            if (error.code === '23505') {
                const detail = error.detail;
                if (detail.includes('category')) {
                    throw new common_1.ConflictException(`El nombre "${dto.category}" ya está registrado.`);
                }
                if (detail.includes('age_range')) {
                    throw new common_1.ConflictException(`El rango de edad "${dto.age_range}" ya está asignado a otra categoría.`);
                }
                throw new common_1.ConflictException('Ya existe una categoría con estos datos.');
            }
            throw error;
        }
    }
    async findAll() {
        return this.db.select().from(schema_1.karateCategoriesTable);
    }
    findOne(id) {
        return `This action returns a #${id} category`;
    }
    async update(dto) {
        const { id, ...updateData } = dto;
        try {
            const [updatedCategory] = await this.db
                .update(schema_1.karateCategoriesTable)
                .set({
                ...updateData,
            })
                .where((0, drizzle_orm_1.eq)(schema_1.karateCategoriesTable.id, id))
                .returning();
            if (!updatedCategory) {
                throw new common_1.NotFoundException(`La categoría con ID ${id} no existe.`);
            }
            return updatedCategory;
        }
        catch (error) {
            if (error.code === '23505') {
                throw new common_1.ConflictException('Los nuevos datos (nombre o rango) ya están en uso por otra categoría.');
            }
            throw error;
        }
    }
    async remove(id) {
        return this.db.delete(schema_1.karateCategoriesTable)
            .where((0, drizzle_orm_1.eq)(schema_1.karateCategoriesTable.id, id))
            .returning();
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(constants_1.PG_CONNECTION)),
    __metadata("design:paramtypes", [neon_serverless_1.NeonDatabase])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map