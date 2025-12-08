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
let AppService = class AppService {
    constructor(conn) {
        this.conn = conn;
    }
    async getUsers() {
        try {
            const result = await this.conn
                .select({
                id: schema_1.usersTable.id,
                email: schema_1.usersTable.email,
                roles_ids: schema_1.usersTable.roles_ids,
            })
                .from(schema_1.usersTable);
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