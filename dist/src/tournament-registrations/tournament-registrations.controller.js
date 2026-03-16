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
exports.TournamentRegistrationsController = void 0;
const common_1 = require("@nestjs/common");
const tournament_registrations_service_1 = require("./tournament-registrations.service");
const create_tournament_registration_dto_1 = require("./dto/create-tournament-registration.dto");
const request_participation_dto_1 = require("./dto/request-participation.dto");
const complete_registration_dto_1 = require("./dto/complete-registration.dto");
const upload_payment_proof_dto_1 = require("./dto/upload-payment-proof.dto");
const reject_registration_dto_1 = require("./dto/reject-registration.dto");
const usersesion_decorator_1 = require("../auth/strategies/usersesion.decorator");
const public_decorator_1 = require("../decorators/public.decorator");
const role_decorators_1 = require("../decorators/role.decorators");
const common_2 = require("@nestjs/common");
const auth_guard_1 = require("../guards/auth.guard");
const roles_guard_1 = require("../guards/roles.guard");
const pagination_tournament_registrations_dto_1 = require("./dto/pagination-tournament-registrations.dto");
let TournamentRegistrationsController = class TournamentRegistrationsController {
    constructor(tournamentRegistrationsService) {
        this.tournamentRegistrationsService = tournamentRegistrationsService;
    }
    async bulkRegister(dto, user) {
        return this.tournamentRegistrationsService.bulkRegisterAthletes({
            event_id: dto.event_id,
            category_id: dto.category_id,
            modality_id: dto.modality_id,
            athlete_ids: dto.athlete_ids,
            master_id: user.sub,
            school_id: user.school_id,
        });
    }
    async getRegistered(divisionId, schoolId) {
        return await this.tournamentRegistrationsService.getAthletesByDivisionAndSchool(divisionId, schoolId);
    }
    async getSchoolsByDivision(divisionId) {
        return await this.tournamentRegistrationsService.getSchoolsByDivision(divisionId);
    }
    async requestParticipation(dto, user) {
        return await this.tournamentRegistrationsService.createParticipationRequest(user.sub, dto.event_id);
    }
    async completeRegistration(registrationId, dto, user) {
        return await this.tournamentRegistrationsService.completeRegistrationByMaster(registrationId, user.sub, dto.category_id, dto.modality_id);
    }
    async uploadPaymentProof(registrationId, dto, user) {
        return await this.tournamentRegistrationsService.uploadPaymentProof(registrationId, user.sub, dto.payment_method, dto.payment_reference, dto.payment_proof_url);
    }
    async getEventRegistrations(eventId, user) {
        return await this.tournamentRegistrationsService.getEventRegistrations(eventId, user.sub);
    }
    async validateRegistration(registrationId, user) {
        return await this.tournamentRegistrationsService.validateRegistration(registrationId, user.sub);
    }
    async validatePayment(registrationId, user) {
        return await this.tournamentRegistrationsService.validatePayment(registrationId, user.sub);
    }
    async rejectRegistration(registrationId, dto, user) {
        return await this.tournamentRegistrationsService.rejectRegistration(registrationId, user.sub, dto.rejection_reason);
    }
    async getMyEvents(query, user) {
        return await this.tournamentRegistrationsService.getEventsWithEnrollmentStatus(user.sub, query);
    }
};
exports.TournamentRegistrationsController = TournamentRegistrationsController;
__decorate([
    (0, common_1.Post)('bulk'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true, whitelist: true })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, usersesion_decorator_1.Usersesion)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_tournament_registration_dto_1.CreateTournamentRegistrationDto, Object]),
    __metadata("design:returntype", Promise)
], TournamentRegistrationsController.prototype, "bulkRegister", null);
__decorate([
    (0, common_1.Get)('division/:divisionId/school/:schoolId'),
    __param(0, (0, common_1.Param)('divisionId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('schoolId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], TournamentRegistrationsController.prototype, "getRegistered", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('schools-by-division/:divisionId'),
    __param(0, (0, common_1.Param)('divisionId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], TournamentRegistrationsController.prototype, "getSchoolsByDivision", null);
__decorate([
    (0, common_1.Post)('request-participation'),
    (0, common_2.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    (0, role_decorators_1.Roles)(5),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true, whitelist: true })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, usersesion_decorator_1.Usersesion)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_participation_dto_1.RequestParticipationDto, Object]),
    __metadata("design:returntype", Promise)
], TournamentRegistrationsController.prototype, "requestParticipation", null);
__decorate([
    (0, common_1.Patch)(':registrationId/complete'),
    (0, common_2.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    (0, role_decorators_1.Roles)(2),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true, whitelist: true })),
    __param(0, (0, common_1.Param)('registrationId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, usersesion_decorator_1.Usersesion)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, complete_registration_dto_1.CompleteRegistrationDto, Object]),
    __metadata("design:returntype", Promise)
], TournamentRegistrationsController.prototype, "completeRegistration", null);
__decorate([
    (0, common_1.Post)(':registrationId/upload-payment'),
    (0, common_2.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    (0, role_decorators_1.Roles)(5),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true, whitelist: true })),
    __param(0, (0, common_1.Param)('registrationId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, usersesion_decorator_1.Usersesion)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, upload_payment_proof_dto_1.UploadPaymentProofDto, Object]),
    __metadata("design:returntype", Promise)
], TournamentRegistrationsController.prototype, "uploadPaymentProof", null);
__decorate([
    (0, common_1.Get)('event/:eventId/registrations'),
    (0, common_2.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    (0, role_decorators_1.Roles)(2),
    __param(0, (0, common_1.Param)('eventId', common_1.ParseIntPipe)),
    __param(1, (0, usersesion_decorator_1.Usersesion)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], TournamentRegistrationsController.prototype, "getEventRegistrations", null);
__decorate([
    (0, common_1.Patch)(':registrationId/validate'),
    (0, common_2.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    (0, role_decorators_1.Roles)(2),
    __param(0, (0, common_1.Param)('registrationId', common_1.ParseIntPipe)),
    __param(1, (0, usersesion_decorator_1.Usersesion)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], TournamentRegistrationsController.prototype, "validateRegistration", null);
__decorate([
    (0, common_1.Patch)(':registrationId/validate-payment'),
    (0, common_2.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    (0, role_decorators_1.Roles)(2),
    __param(0, (0, common_1.Param)('registrationId', common_1.ParseIntPipe)),
    __param(1, (0, usersesion_decorator_1.Usersesion)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], TournamentRegistrationsController.prototype, "validatePayment", null);
__decorate([
    (0, common_1.Patch)(':registrationId/reject'),
    (0, common_2.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    (0, role_decorators_1.Roles)(2),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true, whitelist: true })),
    __param(0, (0, common_1.Param)('registrationId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, usersesion_decorator_1.Usersesion)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, reject_registration_dto_1.RejectRegistrationDto, Object]),
    __metadata("design:returntype", Promise)
], TournamentRegistrationsController.prototype, "rejectRegistration", null);
__decorate([
    (0, common_1.Get)('athlete/my-events'),
    (0, common_2.UseGuards)(auth_guard_1.AuthGuard),
    (0, role_decorators_1.Roles)(5),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, usersesion_decorator_1.Usersesion)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_tournament_registrations_dto_1.PaginationTournamentRegistrationsDto, Object]),
    __metadata("design:returntype", Promise)
], TournamentRegistrationsController.prototype, "getMyEvents", null);
exports.TournamentRegistrationsController = TournamentRegistrationsController = __decorate([
    (0, common_1.Controller)('tournament-registrations'),
    __metadata("design:paramtypes", [tournament_registrations_service_1.TournamentRegistrationsService])
], TournamentRegistrationsController);
//# sourceMappingURL=tournament-registrations.controller.js.map