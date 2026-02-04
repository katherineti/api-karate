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
exports.ModalitiesController = void 0;
const common_1 = require("@nestjs/common");
const modalities_service_1 = require("./modalities.service");
const create_modality_dto_1 = require("./dto/create-modality.dto");
const public_decorator_1 = require("../decorators/public.decorator");
const pagination_modalities_dto_1 = require("./dto/pagination-modalities.dto");
const update_modality_dto_1 = require("./dto/update-modality.dto");
let ModalitiesController = class ModalitiesController {
    constructor(modalitiesService) {
        this.modalitiesService = modalitiesService;
    }
    create(createModalityDto) {
        return this.modalitiesService.create(createModalityDto);
    }
    findAll() {
        return this.modalitiesService.findAll();
    }
    async findAllPaginated(paginationDto) {
        return this.modalitiesService.findAllPaginated(paginationDto);
    }
    async update(id, updateModalityDto) {
        return await this.modalitiesService.update(id, updateModalityDto);
    }
    async remove(id) {
        return await this.modalitiesService.remove(id);
    }
};
exports.ModalitiesController = ModalitiesController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_modality_dto_1.CreateModalityDto]),
    __metadata("design:returntype", void 0)
], ModalitiesController.prototype, "create", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ModalitiesController.prototype, "findAll", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('list'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true }
    })),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_modalities_dto_1.PaginationModalitiesDto]),
    __metadata("design:returntype", Promise)
], ModalitiesController.prototype, "findAllPaginated", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Patch)(':id'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true, whitelist: true })),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_modality_dto_1.UpdateModalityDto]),
    __metadata("design:returntype", Promise)
], ModalitiesController.prototype, "update", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ModalitiesController.prototype, "remove", null);
exports.ModalitiesController = ModalitiesController = __decorate([
    (0, common_1.Controller)('modalities'),
    __metadata("design:paramtypes", [modalities_service_1.ModalitiesService])
], ModalitiesController);
//# sourceMappingURL=modalities.controller.js.map