"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const path_1 = require("path");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const frontendLocalUrl = 'http://localhost:4000';
    const frontendUrl = 'https://sram-integrated.vercel.app';
    app.enableCors();
    app.useStaticAssets((0, path_1.join)(process.cwd(), 'uploads'), {
        prefix: '/uploads/',
    });
    await app.listen(process.env.PORT || 3000);
    console.log(`escuchando en el puerto ${process.env.PORT || 3000}`);
}
bootstrap();
//# sourceMappingURL=main.js.map