import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const frontendLocalUrl = 'http://localhost:4000'; 
  const frontendUrl = 'https://sram-integrated.vercel.app';
  app.enableCors({
    origin: [
      frontendLocalUrl, 
      frontendUrl, 
      'https://studio.firebase.google.com/',
      'https://6000-firebase-studio-1764097833286.cluster-hlmk2l2htragyudeyf6f3tzsi6.cloudworkstations.dev/login',

      'https://9000-firebase-studio-1764097833286.cluster-hlmk2l2htragyudeyf6f3tzsi6.cloudworkstations.dev',
      '*',
    ],
    methods: ['GET','POST','PUT','PATCH','DELETE'], 
    allowedHeaders: ['Content-Type', 'Origin', 'Authorization', 'Accept'],
    credentials: true // Recomendado si vas a manejar cookies o credenciales.
  });

  // 💥 CRÍTICO: Escucha en el puerto que Render asigna (process.env.PORT)
  await app.listen(process.env.PORT || 3000); 
  console.log(`escuchando en el puerto ${process.env.PORT || 3000}`)
}
bootstrap();