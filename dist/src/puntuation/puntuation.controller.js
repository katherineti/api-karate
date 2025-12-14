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
exports.PuntuationController = void 0;
const common_1 = require("@nestjs/common");
const puntuation_service_1 = require("./puntuation.service");
const auth_guard_1 = require("../guards/auth.guard");
let PuntuationController = class PuntuationController {
    constructor(puntuationService) {
        this.puntuationService = puntuationService;
    }
    async getAthleteBySchool(school_id) {
        return this.puntuationService.getAthletesBySchool(school_id);
    }
};
exports.PuntuationController = PuntuationController;
__decorate([
    (0, common_1.Get)('athletes-by-school/:school_id'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Param)('school_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PuntuationController.prototype, "getAthleteBySchool", null);
exports.PuntuationController = PuntuationController = __decorate([
    (0, common_1.Controller)('puntuation'),
    __metadata("design:paramtypes", [puntuation_service_1.PuntuationService])
], PuntuationController);
//# sourceMappingURL=puntuation.controller.js.map