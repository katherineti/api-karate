// src/api/index.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';

// Variable global para cachear el server después del primer "cold start"
let cachedServer: any; 

// 1. Función para crear el server de NestJS con Express
async function createExpressApp(): Promise<any> {
    const expressApp = express();
    const adapter = new ExpressAdapter(expressApp);
    const app = await NestFactory.create(AppModule, adapter);
    
    // Configuraciones de CORS de tu main.ts
    app.enableCors({
        origin: ['https://www.appfrontangular.com'],
        methods: ['GET', 'POST', 'PUT', 'DELETE'], // Agregué PUT, ya que 'UPDATE' no es un método HTTP estándar.
        allowedHeaders: ['content-Type', 'origin'],
        credentials: false
    });

    // Construir la aplicación (inicializar los módulos, etc.)
    await app.init();
    return expressApp;
}

// 2. Handler principal que usa el server cacheado
export default async function handler(req, res) {
    if (!cachedServer) {
        console.log("Inicializando NestJS Serverless (Cold Start)...");
        cachedServer = await createExpressApp();
    }
    
    // Una vez inicializado, usa el server cacheado para manejar la solicitud
    cachedServer(req, res);
}