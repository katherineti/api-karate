// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
import * as serverless from 'serverless-http';

// 1. Crea la instancia de Express
const expressApp = express();

// 2. Función de bootstrapping
async function bootstrap() {
  const app = await NestFactory.create(
    AppModule,
    // Usamos el adaptador de Express para montarlo sobre nuestra instancia
    new ExpressAdapter(expressApp), 
  );

  // Configuración de CORS
  app.enableCors({
    origin: ['*'],
    methods: ['GET','POST','PUT','PATCH','DELETE'], 
    allowedHeaders: ['content-Type', 'origin'],
    credentials: false
  });

  // Inicializa la aplicación (sin llamar a .listen())
  await app.init();
}

// 3. Llama a la función de bootstrapping
bootstrap();

// 4. EXPORTA el handler que Vercel necesita
// serverless(expressApp) envuelve el servidor Express para ser ejecutado como Serverless Function
export default serverless(expressApp);