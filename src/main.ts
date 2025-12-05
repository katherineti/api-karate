import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: [
      'http://localhost:4000', 
      'https://api-karate.onrender.com', 
    ],
    methods: ['GET','POST','PUT','PATCH','DELETE'], 
    // Aseguramos las cabeceras comunes necesarias para peticiones con JSON y autenticación
    allowedHeaders: ['Content-Type', 'Origin', 'Authorization', 'Accept'],
    credentials: true // Recomendado si vas a manejar cookies o credenciales.
  });

  // 💥 CRÍTICO: Escucha en el puerto que Render asigna (process.env.PORT)
  await app.listen(process.env.PORT || 3000); 
  console.log(`escuchando en el puerto ${process.env.PORT || 3000}`)
}
bootstrap();