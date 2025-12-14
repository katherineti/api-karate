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
exports.PuntuationService = void 0;
const common_1 = require("@nestjs/common");
const constants_1 = require("../constants");
const neon_serverless_1 = require("drizzle-orm/neon-serverless");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const constants_2 = require("../constants");
const shools_service_1 = require("../shools/shools.service");
let PuntuationService = class PuntuationService {
    constructor(db, shoolsService) {
        this.db = db;
        this.shoolsService = shoolsService;
    }
    async getAthletesBySchool(school_id) {
        const school = await this.shoolsService.getById(school_id);
        if (!school) {
            throw new Error("La escuela con id " + school_id + " no existe");
        }
        try {
            const schoolCondition = (0, drizzle_orm_1.eq)(schema_1.usersTable.school_id, school_id);
            const roleCondition = (0, drizzle_orm_1.sql) `${schema_1.usersTable.roles_ids} @> ${drizzle_orm_1.sql.raw(`'[${constants_2.ROL_ALUMNO}]'`)}`;
            const result = await this.db.select({
                id: schema_1.usersTable.id,
                name: schema_1.usersTable.name,
                lastname: schema_1.usersTable.lastname,
                email: schema_1.usersTable.email,
            }).from(schema_1.usersTable)
                .where((0, drizzle_orm_1.and)(schoolCondition, roleCondition));
            return result || null;
        }
        catch (err) {
            console.error("Error en la base de datos al buscar los atletas de la escuela: ", err);
            throw new Error("Error al obtener los atletas de la escuela " + err);
        }
    }
};
exports.PuntuationService = PuntuationService;
exports.PuntuationService = PuntuationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(constants_1.PG_CONNECTION)),
    __metadata("design:paramtypes", [neon_serverless_1.NeonDatabase, shools_service_1.ShoolsService])
], PuntuationService);
//# sourceMappingURL=puntuation.service.js.map