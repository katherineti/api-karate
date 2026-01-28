"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const config_1 = require("@nestjs/config");
const validation_env_schema_1 = require("./config/validation-env.schema");
const db_module_1 = require("./db/db.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const shools_module_1 = require("./shools/shools.module");
const puntuation_module_1 = require("./puntuation/puntuation.module");
const events_module_1 = require("./events/events.module");
const categories_module_1 = require("./categories/categories.module");
const event_config_module_1 = require("./event-config/event-config.module");
const modalities_module_1 = require("./modalities/modalities.module");
const core_1 = require("@nestjs/core");
const at_guard_1 = require("./guards/at.guard");
const notifications_module_1 = require("./notifications/notifications.module");
const tournament_registrations_module_1 = require("./tournament-registrations/tournament-registrations.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            db_module_1.DrizzleDbConecctionModule,
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
                validationSchema: validation_env_schema_1.validationSchema,
                validationOptions: {
                    abortEarly: true,
                    allowUnknown: true,
                },
            }),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            shools_module_1.ShoolsModule,
            puntuation_module_1.PuntuationModule,
            events_module_1.EventsModule,
            categories_module_1.CategoriesModule,
            event_config_module_1.EventConfigModule,
            modalities_module_1.ModalitiesModule,
            notifications_module_1.NotificationsModule,
            tournament_registrations_module_1.TournamentRegistrationsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_GUARD,
                useClass: at_guard_1.AtGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map