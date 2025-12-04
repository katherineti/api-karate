import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { validationSchema } from './config/validation-env.schema';
import { DrizzleDbConecctionModule } from './db/db.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    DrizzleDbConecctionModule,
    ConfigModule.forRoot({
      isGlobal:true,
      envFilePath: '.env',

     // Validacion de las variables de entorno con joi:
       validationSchema: validationSchema,

      // Opciones de validación de Joi
      validationOptions: {
        abortEarly: true, // Detiene la validación en el primer error
        allowUnknown: true, // Permite variables en .env no definidas en el esquema
      }, 
    }),
     AuthModule,
     UsersModule,
    // RolesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,

    // ❌ COMENTAR TEMPORALMENTE EL GUARD GLOBAL
/*     {
      provide: APP_GUARD,
      useClass: RolesGuard,
    }, */

  ],
})
export class AppModule {}