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
exports.ParticipantRequestsController = void 0;
const common_1 = require("@nestjs/common");
const participantRequests_service_1 = require("./participantRequests.service");
const usersesion_decorator_1 = require("../../auth/strategies/usersesion.decorator");
const createParticipantRequest_dto_1 = require("./createParticipantRequest.dto");
let ParticipantRequestsController = class ParticipantRequestsController {
    constructor(participantRequestsService) {
        this.participantRequestsService = participantRequestsService;
    }
    async createParticipantRequest(dto, user) {
        return this.participantRequestsService.createParticipantRequest(dto, user);
    }
    async approve(id, user) {
        return this.participantRequestsService.approveRequest(id, user.sub);
    }
    async reject(id, reason, user) {
        return this.participantRequestsService.rejectRequest(id, user.sub, reason || 'No especificado');
    }
};
exports.ParticipantRequestsController = ParticipantRequestsController;
__decorate([
    (0, common_1.Post)('request-slots'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, usersesion_decorator_1.Usersesion)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [createParticipantRequest_dto_1.CreateParticipantRequestDto, Object]),
    __metadata("design:returntype", Promise)
], ParticipantRequestsController.prototype, "createParticipantRequest", null);
__decorate([
    (0, common_1.Patch)(':id/approve'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, usersesion_decorator_1.Usersesion)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ParticipantRequestsController.prototype, "approve", null);
__decorate([
    (0, common_1.Patch)(':id/reject'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)('reason')),
    __param(2, (0, usersesion_decorator_1.Usersesion)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, Object]),
    __metadata("design:returntype", Promise)
], ParticipantRequestsController.prototype, "reject", null);
exports.ParticipantRequestsController = ParticipantRequestsController = __decorate([
    (0, common_1.Controller)('participantRequests'),
    __metadata("design:paramtypes", [participantRequests_service_1.ParticipantRequestsService])
], ParticipantRequestsController);
//# sourceMappingURL=participantRequests.controller.js.map