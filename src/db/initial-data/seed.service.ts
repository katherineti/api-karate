// drizzle/seed.ts (Coloca este archivo en la raíz o en una carpeta 'drizzle')

import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import 'dotenv/config'; // Necesario para cargar DATABASE_URL
// 💥 Importaciones relativas: AJUSTA LA RUTA DE TU ESQUEMA
import * as schema from '../schema'; 
import { roleTable, statusTable } from '../schema'; 
async function seed() {
    
    // 1. Verificar la cadena de conexión
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error('❌ Error: La variable DATABASE_URL no está definida en .env');
        process.exit(1);
    }
    
    const rolesToInsert = [
        { name: 'administrador' },
        { name: 'master' },
        { name: 'juez' },
        { name: 'representante' }, 
        { name: 'alumno' }, 
    ];

const statusToInsert = [
        { status: 'activo' },
        { status: 'inactivo' }, 
    ];
    
    // 2. Crear y conectar el cliente PG (autónomo)
    const client = new Client({
        connectionString: connectionString,
        ssl: {
            rejectUnauthorized: false, 
        },
    });

    try {
        await client.connect(); 
        const db = drizzle(client, { schema }); // Instancia Drizzle con el esquema

        console.log('1/2: Iniciando seeding de roles (Autónomo)...');

        // 3. Ejecutar el insert con ON CONFLICT (para idempotencia)
        await db.insert(roleTable)
            .values(rolesToInsert)
            .onConflictDoNothing({ 
                target: roleTable.name
            });

        console.log('✅ Seeding de roles completado.');

        console.log('  -> 2/2: Insertando estados (Status)...');
        await db.insert(statusTable)
            .values(statusToInsert)
            .onConflictDoNothing({ 
                target: statusTable.status // Usamos el campo 'status' para conflicto
            });
        console.log('✅ Status completado.');

        console.log('Seeding de datos iniciales finalizado correctamente.');

    } catch (error) {
        console.error('❌ Error CRÍTICO durante el seeding:', error);
        process.exit(1);
    } finally {
        // 4. Cerrar la conexión
        await client.end(); 
    }
}

seed();