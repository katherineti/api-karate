"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const frontendLocalUrl = 'http://localhost:4000';
    const frontendUrl = 'https://sram-integrated.vercel.app';
    app.enableCors({
        origin: [
            frontendLocalUrl,
            frontendUrl,
            'https://studio.firebase.google.com/',
            'https://6000-firebase-studio-1764097833286.cluster-hlmk2l2htragyudeyf6f3tzsi6.cloudworkstations.dev',
            '*'
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