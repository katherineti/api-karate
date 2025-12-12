"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_postgres_1 = require("drizzle-orm/node-postgres");
const pg_1 = require("pg");
require("dotenv/config");
const schema = require("../schema");
const schema_1 = require("../schema");
async function seed() {
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
    const client = new pg_1.Client({
        connectionString: connectionString,
        ssl: {
            rejectUnauthorized: false,
        },
    });
    try {
        await client.connect();
        const db = (0, node_postgres_1.drizzle)(client, { schema });
        console.log('1/2: Iniciando seeding de roles (Autónomo)...');
        await db.insert(schema_1.roleTable)
            .values(rolesToInsert)
            .onConflictDoNothing({
            target: schema_1.roleTable.name
        });
        console.log('✅ Seeding de roles completado.');
        console.log('  -> 2/2: Insertando estados (Status)...');
        await db.insert(schema_1.statusTable)
            .values(statusToInsert)
            .onConflictDoNothing({
            target: schema_1.statusTable.status
        });
        console.log('✅ Status completado.');
        console.log('Seeding de datos iniciales finalizado correctamente.');
    }
    catch (error) {
        console.error('❌ Error CRÍTICO durante el seeding:', error);
        process.exit(1);
    }
    finally {
        await client.end();
    }
}
seed();
//# sourceMappingURL=seed.service.js.map