"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KarateBeltsModule = void 0;
const common_1 = require("@nestjs/common");
const karate_belts_service_1 = require("./karate-belts.service");
const karate_belts_controller_1 = require("./karate-belts.controller");
const db_module_1 = require("../db/db.module");
let KarateBeltsModule = class KarateBeltsModule {
};
exports.KarateBeltsModule = KarateBeltsModule;
exports.KarateBeltsModule = KarateBeltsModule = __decorate([
    (0, common_1.Module)({
        imports: [db_module_1.DrizzleDbConecctionModule],
        controllers: [karate_belts_controller_1.KarateBeltsController],
        providers: [karate_belts_service_1.KarateBeltsService],
    })
], KarateBeltsModule);
//# sourceMappingURL=karate-belts.module.js.map