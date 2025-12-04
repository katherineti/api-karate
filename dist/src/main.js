"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const platform_express_1 = require("@nestjs/platform-express");
const express = require("express");
const serverless = require("serverless-http");
const expressApp = express();
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_express_1.ExpressAdapter(expressApp));
    app.enableCors({
        origin: ['*'],
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        allowedHeaders: ['content-Type', 'origin'],
        credentials: false
    });
    await app.init();
}
bootstrap();
exports.default = serverless(expressApp);
//# sourceMappingURL=main.js.map