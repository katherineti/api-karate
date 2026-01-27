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
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const constants_1 = require("../constants");
const neon_serverless_1 = require("drizzle-orm/neon-serverless");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
let NotificationsService = class NotificationsService {
    constructor(db) {
        this.db = db;
    }
    async findByUser(userId) {
        return await this.db
            .select()
            .from(schema_1.notificationsTable)
            .where((0, drizzle_orm_1.eq)(schema_1.notificationsTable.recipient_id, userId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.notificationsTable.created_at));
    }
    async markAsRead(notificationId, userId) {
        return await this.db
            .update(schema_1.notificationsTable)
            .set({ is_read: true })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.notificationsTable.id, notificationId), (0, drizzle_orm_1.eq)(schema_1.notificationsTable.recipient_id, userId)))
            .returning();
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(constants_1.PG_CONNECTION)),
    __metadata("design:paramtypes", [neon_serverless_1.NeonDatabase])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map