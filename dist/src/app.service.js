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
exports.AppService = void 0;
const common_1 = require("@nestjs/common");
const constants_1 = require("./constants");
const neon_serverless_1 = require("drizzle-orm/neon-serverless");
const schema_1 = require("./db/schema");
const drizzle_orm_1 = require("drizzle-orm");
let AppService = class AppService {
    constructor(conn) {
        this.conn = conn;
        console.log("********desde AppService - Coneccion BD:  ", this.conn);
    }
    async getUsers() {
        try {
            const result = await this.conn
                .select({
                id: schema_1.usersTable.id,
                email: schema_1.usersTable.email,
                role: schema_1.roleTable.name,
            })
                .from(schema_1.usersTable)
                .innerJoin(schema_1.roleTable, (0, drizzle_orm_1.eq)(schema_1.usersTable.roles_id, schema_1.roleTable.id));
            return result;
        }
        catch (err) {
            console.error("Error al obtener usuarios:", err);
            throw new Error("Error al obtener usuarios");
        }
    }
};
exports.AppService = AppService;
exports.AppService = AppService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(constants_1.PG_CONNECTION)),
    __metadata("design:paramtypes", [neon_serverless_1.NeonDatabase])
], AppService);
//# sourceMappingURL=app.service.js.map