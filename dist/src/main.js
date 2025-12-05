"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: [
            'http://localhost:4000',
            'https://api-karate.onrender.com',
        ],
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Origin', 'Authorization', 'Accept'],
        credentials: true
    });
    await app.listen(process.env.PORT || 3000);
    console.log(`escuchando en el puerto ${process.env.PORT || 3000}`);
}
bootstrap();
//# sourceMappingURL=main.js.map