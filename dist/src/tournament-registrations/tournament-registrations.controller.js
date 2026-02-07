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
const usersesion_decorator_1 = require("../auth/strategies/usersesion.decorator");
const public_decorator_1 = require("../decorators/public.decorator");
let TournamentRegistrationsController = class TournamentRegistrationsController {
    constructor(tournamentRegistrationsService) {
        this.tournamentRegistrationsService = tournamentRegistrationsService;
    }
    async bulkRegister(dto, user) {
        return this.tournamentRegistrationsService.bulkRegisterAthletes({
            division_id: dto.division_id,
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
exports.TournamentRegistrationsController = TournamentRegistrationsController = __decorate([
    (0, common_1.Controller)('tournament-registrations'),
    __metadata("design:paramtypes", [tournament_registrations_service_1.TournamentRegistrationsService])
], TournamentRegistrationsController);
//# sourceMappingURL=tournament-registrations.controller.js.map