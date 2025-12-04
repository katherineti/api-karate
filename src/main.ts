// src/main.ts (Versión ESTÁNDAR para Render/Contenedor)
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Tu configuración CORS
  app.enableCors({
    origin: ['*'],
    methods: ['GET','POST','PUT','PATCH','DELETE'], 
    allowedHeaders: ['content-Type', 'origin'],
    credentials: false
  });

  // 💥 CRÍTICO: Escucha en el puerto que Render asigna (process.env.PORT)
  await app.listen(process.env.PORT || 3000); 
  console.log(`escuchando en el puerto ${process.env.PORT || 3000}`)
}
bootstrap();
// src/main.ts (Patrón Final con Body Parsers de Express) PARA VWERCEL
/*
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
import * as serverless from 'serverless-http';

// ** 1. Variables globales
let cachedServer;
const expressApp = express();

// 💥 CRÍTICO: Añadir Body Parsers antes de la inicialización de NestJS
expressApp.use(express.json());
expressApp.use(express.urlencoded({ extended: true }));

// ** 2. Función de inicialización
async function bootstrapServer() {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  );

  // Configuración de CORS
  app.enableCors({ 
    origin: ['*'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['content-Type', 'origin'],
    credentials: false,
  });

  // 💥 CRÍTICO: Monta las rutas en expressApp
  await app.init(); 

  // Crea el handler de serverless
  cachedServer = serverless(expressApp);
  return cachedServer;
}

// ** 3. EXPORTACIÓN DEL HANDLER
export default async (req, res) => {
  if (!cachedServer) {
    // Si no está inicializado, lo inicializa de forma ASÍNCRONA
    await bootstrapServer();
  }
  return cachedServer(req, res);
};
*/