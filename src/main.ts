import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const frontendLocalUrl = 'http://localhost:4000'; 
  const frontendUrl = 'https://sram-integrated.vercel.app';
/*   app.enableCors({
    origin: [
       frontendLocalUrl, 
       frontendUrl, 
       'https://studio.firebase.google.com/',
       'https://6000-firebase-studio-1764097833286.cluster-hlmk2l2htragyudeyf6f3tzsi6.cloudworkstations.dev',
      '*'
    ],
    methods: ['GET','POST','PUT','PATCH','DELETE'], 
    allowedHeaders: ['Content-Type', 'Origin', 'Authorization', 'Accept'],
    credentials: true // Recomendado si vas a manejar cookies o credenciales.
  }); */
  app.enableCors();

// Esto hace que la carpeta 'uploads' sea accesible desde fuera
//para que se vea la imagen en http://localhost:3000/uploads/archivo.jpg 
// Habilitar la carpeta 'uploads' como estática
app.useStaticAssets(join(process.cwd(), 'uploads'), { //no usar __dirname
  prefix: '/uploads/', 
});

// Verificar si la carpeta existe. Descomentar para pruebas de codigo:
/* const uploadPath = join(process.cwd(), 'uploads');
console.log('Carpeta de imágenes apuntando a:', uploadPath);

const fs = require('fs');
if (fs.existsSync(uploadPath)) {
    console.log('✅ La carpeta EXISTE');
    console.log('Contenido:', fs.readdirSync(uploadPath));
} else {
    console.log('❌ La carpeta NO EXISTE en esa ruta');
} */

  // 💥 CRÍTICO: Escucha en el puerto que Render asigna (process.env.PORT)
  await app.listen(process.env.PORT || 3000); 
  console.log(`escuchando en el puerto ${process.env.PORT || 3000}`)
}
bootstrap();