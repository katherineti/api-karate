import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { validationSchema } from './config/validation-env.schema';
import { DrizzleDbConecctionModule } from './db/db.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ShoolsModule } from './shools/shools.module';
import { PuntuationModule } from './puntuation/puntuation.module';
import { EventsModule } from './events/events.module';
import { CategoriesModule } from './categories/categories.module';
import { EventConfigModule } from './event-config/event-config.module';
import { ModalitiesModule } from './modalities/modalities.module';
import { APP_GUARD } from '@nestjs/core';
import { AtGuard } from './guards/at.guard';
import { NotificationsModule } from './notifications/notifications.module';
import { TournamentRegistrationsModule } from './tournament-registrations/tournament-registrations.module';
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
     ShoolsModule,
     PuntuationModule,
     EventsModule,
     CategoriesModule,
     EventConfigModule,
     ModalitiesModule,
     NotificationsModule,
     TournamentRegistrationsModule,
    // RolesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AtGuard,
    },/* 
    {
      provide: APP_GUARD,
      useClass: RolesGuard
    } */
  ],
/*   providers: [
    AppService,

    // ❌ COMENTAR TEMPORALMENTE EL GUARD GLOBAL
/*     {
      provide: APP_GUARD,
      useClass: RolesGuard,
    }, * /

  ], */
})
export class AppModule {}