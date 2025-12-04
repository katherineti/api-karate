/* import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PG_CONNECTION } from './constants';
import { drizzle } from 'drizzle-orm/neon-http';

@Module({
    providers:[
        {
            provide: PG_CONNECTION,
            inject: [ConfigService],
            useFactory: async (configService: ConfigService)=>{
                const connectionString = configService.get<string>('DATABASE_URL')!;
                const db = drizzle(connectionString)
                return db
            },
        },
    ],
    exports: [PG_CONNECTION],
})
export class DrizzleDbConecctionModule{} */
// src/db/db.module.ts (SOLUCIÓN ROBUSTA CON PG Y SSL)
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PG_CONNECTION } from '../constants';
// 💥 CAMBIO: Usar node-postgres (pg)
import { Client } from 'pg'; 
import { drizzle } from 'drizzle-orm/node-postgres';

@Module({
    providers:[
        {
            provide: PG_CONNECTION,
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => {
                const connectionString = configService.get<string>('DATABASE_URL');
                
                if (!connectionString) {
                    throw new Error('DATABASE_URL no está definida.');
                }

                // 💥 CRÍTICO: Inicializar el cliente PG con la configuración SSL para Neon
                const client = new Client({
                    connectionString: connectionString,
                    // SSL es crucial para Neon/servicios externos
                    ssl: {
                        rejectUnauthorized: false, 
                    },
                });

                // Conectarse antes de pasarlo a Drizzle
                await client.connect(); 
                
                // Retornar la instancia de Drizzle
                return drizzle(client);
            },
        },
    ],
    exports: [PG_CONNECTION],
})
export class DrizzleDbConecctionModule{}