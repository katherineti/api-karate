"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PuntuationModule = void 0;
const common_1 = require("@nestjs/common");
const puntuation_controller_1 = require("./puntuation.controller");
const puntuation_service_1 = require("./puntuation.service");
const db_module_1 = require("../db/db.module");
const shools_module_1 = require("../shools/shools.module");
let PuntuationModule = class PuntuationModule {
};
exports.PuntuationModule = PuntuationModule;
exports.PuntuationModule = PuntuationModule = __decorate([
    (0, common_1.Module)({
        imports: [db_module_1.DrizzleDbConecctionModule, shools_module_1.ShoolsModule],
        controllers: [puntuation_controller_1.PuntuationController],
        providers: [puntuation_service_1.PuntuationService],
        exports: [puntuation_service_1.PuntuationService],
    })
], PuntuationModule);
//# sourceMappingURL=puntuation.module.js.map