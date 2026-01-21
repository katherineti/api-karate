"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventConfigModule = void 0;
const common_1 = require("@nestjs/common");
const event_config_service_1 = require("./event-config.service");
const event_config_controller_1 = require("./event-config.controller");
const db_module_1 = require("../db/db.module");
let EventConfigModule = class EventConfigModule {
};
exports.EventConfigModule = EventConfigModule;
exports.EventConfigModule = EventConfigModule = __decorate([
    (0, common_1.Module)({
        imports: [db_module_1.DrizzleDbConecctionModule],
        controllers: [event_config_controller_1.EventConfigController],
        providers: [event_config_service_1.EventConfigService],
        exports: [event_config_service_1.EventConfigService],
    })
], EventConfigModule);
//# sourceMappingURL=event-config.module.js.map