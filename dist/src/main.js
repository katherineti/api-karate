"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: ['https://www.appfrontangular.com'],
        methods: ['GET', 'POST', 'UPDATE', 'DELETE'],
        allowedHeaders: ['content-Type', 'origin'],
        credentials: false
    });
    await app.listen(process.env.PORT);
    console.log(`escuchando en el puerto ${process.env.PORT}`);
}
bootstrap();
//# sourceMappingURL=main.js.map