import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import 'dotenv/config';
import * as schema from '../schema'; 
import { roleTable, statusTable, schoolTable, karateCategoriesTable, karateBeltsTable } from '../schema'; 
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
        { status: 'actualizado' }, 
    ];

    const rawSchoolsData = [
        { slug: 'antonio-diaz-dojo', name: 'Antonio Díaz Dojo'},
        { slug: 'shito-ryu-karate', name: 'Shito-Ryu Karate'},
        { slug: 'dojo-okinawa', name: 'Dojo Okinawa'},
        { slug: 'bushido-vzla', name: 'Bushido Vzla'},
        { slug: 'shotokan-caracas', name: 'Shotokan Caracas'},
        { slug: 'gensei-ryu-miranda', name: 'Gensei-Ryu Miranda'},
        { slug: 'wado-ryu-valencia', name: 'Wado-Ryu Valencia' },
        { slug: 'kyokushin-maracay', name: 'Kyokushin Maracay'},
        { slug: 'shorin-ryu-barquisimeto', name: 'Shorin-Ryu Barquisimeto'}, 
        { slug: 'goju-ryu-merida', name: 'Goju-Ryu Mérida'},
        { slug: 'isshin-ryu-san-cristobal', name: 'Isshin-Ryu San Cristóbal' },
        { slug: 'kenpo-karate-zulia', name: 'Kenpo Karate Zulia' },
        { slug: 'ryuei-ryu-anzoategui', name: 'Ryuei-Ryu Anzoátegui' },
        { slug: 'shudokan-bolivar', name: 'Shudokan Bolívar' },
        { slug: 'yoshukai-sucre', name: 'Yoshukai Sucre' },
    ];

    const schoolsToInsert = rawSchoolsData
        .filter(school => school.name && school.slug)
        .map(school => ({
            name: school.name.trim(), 
            slug: school.slug.trim(), 
        }));

    const karateCategoriesToInsert = [
        {id:1, category: 'Cadete' },
        {id:2, category: 'Infantil C' },
        {id:3, category: 'Junior' },
        {id:4, category: 'Adulto' },
    ];

    const karateBeltsToInsert = [
        { id:1, belt: 'Blanco' },
        { id:2, belt: 'Amarillo' },
        { id:3, belt: 'Naranja' },
        { id:4, belt: 'Verde' },
        { id:5, belt: 'Azul' },
        { id:6, belt: 'Púrpura' },
        { id:7, belt: 'Marrón' },
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

        //Ejecutar el insert con ON CONFLICT (para idempotencia)
        await db.insert(roleTable)
            .values(rolesToInsert)
            .onConflictDoNothing({ 
                target: roleTable.name
            });

        console.log('✅ Seeding de roles completado.');

        console.log('  -> 2/2: Insertando estados (status)...');
        await db.insert(statusTable)
            .values(statusToInsert)
            .onConflictDoNothing({ 
                target: statusTable.status // Usamos el campo 'status' para conflicto
            });
        console.log('✅ Status completado.');

        // SEEDING DE ESCUELAS (SCHOOLS)
        console.log('  -> 3/3: Insertando escuelas (schools)...');
        await db.insert(schoolTable)
            .values(schoolsToInsert)
            // Usamos el campo 'slug' como target para evitar duplicados, ya que es el identificador único.
            .onConflictDoNothing({ target: schoolTable.slug }); 
        console.log(`✅ Schools completado. Se insertaron ${schoolsToInsert.length} escuelas.`);

        // SEEDING DE CATEGORÍAS DE KARATE
        console.log('  -> 4/4: Insertando categorías de karate (karateCategories)...');
        await db.insert(karateCategoriesTable)
            .values(karateCategoriesToInsert)
            .onConflictDoNothing({ target: karateCategoriesTable.category }); 
        console.log(`✅ Karate Categories completado. Se insertaron ${karateCategoriesToInsert.length} categorías.`);

        // SEEDING DE NIVELES DE KARATE
        console.log('  -> 5/5: Insertando cinturones de karate (karateBelts)...');
        await db.insert(karateBeltsTable)
            .values(karateBeltsToInsert)
            .onConflictDoNothing({ target: karateBeltsTable.belt }); 
        console.log(`✅ Karate Belts completado. Se insertaron ${karateBeltsToInsert.length} cinturones.`);

        console.log('Seeding de datos iniciales finalizado correctamente.');

    } catch (error) {
        console.error('❌ Error CRÍTICO durante el seeding:', error);
        process.exit(1);
    } finally {
        //Cerrar la conexión
        await client.end(); 
    }
}

seed();