// src/main.ts (SOLUCIÓN DE RACE CONDITION EN VERCEL)
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
import * as serverless from 'serverless-http';

// Creamos e inicializamos el servidor una sola vez
const expressApp = express();
let cachedServer; // Almacenará el handler serverless inicializado

async function bootstrap() {
  if (!cachedServer) {
    console.log('Inicializando NestJS (solo la primera vez)');
    
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp), 
    );

    // Configuración de CORS
    app.enableCors({
      origin: ['*'],
      methods: ['GET','POST','PUT','PATCH','DELETE'], 
      allowedHeaders: ['content-Type', 'origin'],
      credentials: false
    });

    // 💥 Paso CRÍTICO: Esperar a que toda la app de NestJS se inicie (incluida la BD)
    await app.init();

    // 4. Crear el handler de serverless DESPUÉS de la inicialización
    cachedServer = serverless(expressApp);
  }
  return cachedServer;
}

// 5. EXPORTAR la función ASÍNCRONA que Vercel llama para cada request
export default async (req, res) => {
  const handler = await bootstrap(); // ✅ Asegura que el app esté inicializado
  return handler(req, res);
};