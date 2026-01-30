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
exports.ShoolsController = void 0;
const common_1 = require("@nestjs/common");
const shools_service_1 = require("./shools.service");
const pagination_schools_dto_1 = require("./dto/pagination-schools.dto");
const public_decorator_1 = require("../decorators/public.decorator");
const update_school_dto_1 = require("./dto/update-school.dto");
const create_school_dto_1 = require("./dto/create-school.dto");
const change_status_school_dto_1 = require("./dto/change-status-school.dto");
const platform_express_1 = require("@nestjs/platform-express");
const common_2 = require("@nestjs/common");
const multer_1 = require("multer");
const path_1 = require("path");
let ShoolsController = class ShoolsController {
    constructor(shoolsService) {
        this.shoolsService = shoolsService;
    }
    async getAll() {
        return this.shoolsService.getAll();
    }
    async getById(id) {
        return await this.shoolsService.getById(id);
    }
    async create(createSchoolDto, file) {
        const logoUrl = file ? file.path.replaceAll('\\', '/') : null;
        return this.shoolsService.create({
            ...createSchoolDto,
            logo_url: logoUrl
        });
    }
    async getSchools(paginationDto) {
        return this.shoolsService.findAllPaginated(paginationDto);
    }
    async update(id, updateSchoolDto) {
        return this.shoolsService.update(id, updateSchoolDto);
    }
    async changeStatus(id, changeStatusDto) {
        return this.shoolsService.changeStatus(id, changeStatusDto.isActive);
    }
    async remove(id) {
        return this.shoolsService.remove(id);
    }
};
exports.ShoolsController = ShoolsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ShoolsController.prototype, "getAll", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ShoolsController.prototype, "getById", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)(),
    (0, common_2.UseInterceptors)((0, platform_express_1.FileInterceptor)('image', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads',
            filename: (req, file, callback) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const ext = (0, path_1.extname)(file.originalname);
                callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
            },
        }),
    })),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({
        transform: true,
        whitelist: true,
        transformOptions: { enableImplicitConversion: true }
    })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_2.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_school_dto_1.CreateSchoolDto, Object]),
    __metadata("design:returntype", Promise)
], ShoolsController.prototype, "create", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('list'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true, whitelist: true })),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_schools_dto_1.PaginationSchoolsDto]),
    __metadata("design:returntype", Promise)
], ShoolsController.prototype, "getSchools", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Patch)(':id'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true, whitelist: true })),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_school_dto_1.UpdateSchoolDto]),
    __metadata("design:returntype", Promise)
], ShoolsController.prototype, "update", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, change_status_school_dto_1.ChangeStatusSchoolDto]),
    __metadata("design:returntype", Promise)
], ShoolsController.prototype, "changeStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ShoolsController.prototype, "remove", null);
exports.ShoolsController = ShoolsController = __decorate([
    (0, common_1.Controller)('shools'),
    __metadata("design:paramtypes", [shools_service_1.ShoolsService])
], ShoolsController);
//# sourceMappingURL=shools.controller.js.map