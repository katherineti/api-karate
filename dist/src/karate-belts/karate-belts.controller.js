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
exports.KarateBeltsController = void 0;
const common_1 = require("@nestjs/common");
const karate_belts_service_1 = require("./karate-belts.service");
const public_decorator_1 = require("../decorators/public.decorator");
const pagination_karate_belts_dto_1 = require("./dto/pagination-karate-belts.dto");
const create_karate_belt_dto_1 = require("./dto/create-karate-belt.dto");
const update_karate_belt_dto_1 = require("./dto/update-karate-belt.dto");
let KarateBeltsController = class KarateBeltsController {
    constructor(karateBeltsService) {
        this.karateBeltsService = karateBeltsService;
    }
    findAll(paginationDto) {
        return this.karateBeltsService.findAllPaginated(paginationDto);
    }
    create(createKarateBeltDto) {
        return this.karateBeltsService.create(createKarateBeltDto);
    }
    update(id, updateKarateBeltDto) {
        return this.karateBeltsService.update(id, updateKarateBeltDto);
    }
    async remove(id) {
        return await this.karateBeltsService.remove(id);
    }
};
exports.KarateBeltsController = KarateBeltsController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('list'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true }
    })),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_karate_belts_dto_1.PaginationKarateBeltsDto]),
    __metadata("design:returntype", void 0)
], KarateBeltsController.prototype, "findAll", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)(),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true, whitelist: true })),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_karate_belt_dto_1.CreateKarateBeltDto]),
    __metadata("design:returntype", void 0)
], KarateBeltsController.prototype, "create", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Patch)(':id'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true, whitelist: true })),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_karate_belt_dto_1.UpdateKarateBeltDto]),
    __metadata("design:returntype", void 0)
], KarateBeltsController.prototype, "update", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], KarateBeltsController.prototype, "remove", null);
exports.KarateBeltsController = KarateBeltsController = __decorate([
    (0, common_1.Controller)('karate-belts'),
    __metadata("design:paramtypes", [karate_belts_service_1.KarateBeltsService])
], KarateBeltsController);
//# sourceMappingURL=karate-belts.controller.js.map