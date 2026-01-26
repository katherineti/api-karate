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
exports.EventConfigController = void 0;
const common_1 = require("@nestjs/common");
const event_config_service_1 = require("./event-config.service");
const toggle_modality_dto_1 = require("./dto/toggle-modality.dto");
const toggle_event_category_dto_1 = require("./dto/toggle-event-category.dto");
const usersesion_decorator_1 = require("../auth/strategies/usersesion.decorator");
const public_decorator_1 = require("../decorators/public.decorator");
let EventConfigController = class EventConfigController {
    constructor(eventConfigService) {
        this.eventConfigService = eventConfigService;
    }
    setup(dto) {
        return this.eventConfigService.setupDivision(dto);
    }
    async toggleCategoryStatus(eventId, categoryId, is_active) {
        return this.eventConfigService.toggleCategoryStatusInEvent(eventId, categoryId, is_active);
    }
    getEventSummary(id, user) {
        console.log("user", user);
        return this.eventConfigService.getEventCategoriesSummary(id, +user.sub, user.roles);
    }
    getEventCategories(id) {
        return this.eventConfigService.getCategoriesByEvent(id);
    }
    toggleModality(dto) {
        return this.eventConfigService.toggleModalityConfig(dto);
    }
    async getModalities(eventId, categoryId) {
        return this.eventConfigService.getModalitiesByEventCategory(eventId, categoryId);
    }
    async toggleCategoryInEvent(dto) {
        return this.eventConfigService.registerCategoryInEvent(dto.event_id, dto.category_id, dto.is_active);
    }
};
exports.EventConfigController = EventConfigController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('setup'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EventConfigController.prototype, "setup", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Patch)('event/:eventId/category/:categoryId/change-status'),
    __param(0, (0, common_1.Param)('eventId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('categoryId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)('is_active')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Boolean]),
    __metadata("design:returntype", Promise)
], EventConfigController.prototype, "toggleCategoryStatus", null);
__decorate([
    (0, common_1.Get)('event/:id/summary'),
    (0, common_1.UsePipes)(common_1.ValidationPipe),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, usersesion_decorator_1.Usersesion)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], EventConfigController.prototype, "getEventSummary", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('event/:id/categories'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], EventConfigController.prototype, "getEventCategories", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Patch)('toggle-modality'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [toggle_modality_dto_1.ToggleModalityDto]),
    __metadata("design:returntype", void 0)
], EventConfigController.prototype, "toggleModality", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('event/:eventId/category/:categoryId/modalities'),
    __param(0, (0, common_1.Param)('eventId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('categoryId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], EventConfigController.prototype, "getModalities", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Patch)('toggle-category'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [toggle_event_category_dto_1.ToggleEventCategoryDto]),
    __metadata("design:returntype", Promise)
], EventConfigController.prototype, "toggleCategoryInEvent", null);
exports.EventConfigController = EventConfigController = __decorate([
    (0, common_1.Controller)('event-config'),
    __metadata("design:paramtypes", [event_config_service_1.EventConfigService])
], EventConfigController);
//# sourceMappingURL=event-config.controller.js.map