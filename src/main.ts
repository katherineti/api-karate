import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
import * as serverless from 'serverless-http';

const expressApp = express();
let cachedServer; // 1. Variable para cachear el servidor inicializado

async function createNestServer() {
  // Solo se ejecuta una vez (Cold Start)
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  );

  app.enableCors({
    origin: ['*'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['content-Type', 'origin'],
    credentials: false
  });

  // CRÍTICO: Esperar la inicialización de NestJS (incluye la conexión a Neon)
  await app.init();
  
  // 2. Devolver el handler de Express envuelto por serverless-http
  return serverless(expressApp);
}

// 3. Handler principal (Vercel llama a esta función)
export default async function (req, res) {
  if (!cachedServer) {
    // 4. Inicializar el servidor SOLO si no está en cache
    cachedServer = await createNestServer();
  }
  // 5. Procesar la solicitud con el servidor cacheado
  return cachedServer(req, res);
};