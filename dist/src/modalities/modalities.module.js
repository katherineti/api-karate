"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModalitiesModule = void 0;
const common_1 = require("@nestjs/common");
const modalities_service_1 = require("./modalities.service");
const modalities_controller_1 = require("./modalities.controller");
const db_module_1 = require("../db/db.module");
let ModalitiesModule = class ModalitiesModule {
};
exports.ModalitiesModule = ModalitiesModule;
exports.ModalitiesModule = ModalitiesModule = __decorate([
    (0, common_1.Module)({
        imports: [db_module_1.DrizzleDbConecctionModule],
        controllers: [modalities_controller_1.ModalitiesController],
        providers: [modalities_service_1.ModalitiesService],
        exports: [modalities_service_1.ModalitiesService],
    })
], ModalitiesModule);
//# sourceMappingURL=modalities.module.js.map