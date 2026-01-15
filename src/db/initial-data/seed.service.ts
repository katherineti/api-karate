import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import 'dotenv/config';
import * as schema from '../schema'; 
import { roleTable, statusTable, schoolTable, karateCategoriesTable, karateBeltsTable, typesEventsTable, subtypesEventsTable } from '../schema'; 
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
        { status: 'Evento programado' },
        { status: 'Evento en curso' },
        { status: 'Evento finalizado' },
        { status: 'Evento cancelado' },
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
        {id:1, category: 'Hasta 5 años (mixto)', age_range: '0-5 años' },
        {id:2, category: 'Infantil', age_range: '10-11 años' },
        {id:3, category: 'Juvenil', age_range: '12-13 años' },
        {id:4, category: 'Cadete', age_range: '14-15 años' },
        {id:5, category: 'Junior', age_range: '16-17 años' },
        {id:6, category: 'Sub-21', age_range: '18-20 años' },
        {id:7, category: 'Senior', age_range: '21 años y más' },
    ];

    const karateBeltsToInsert = [
        { id:1, belt: 'Blanco' },
        { id:2, belt: 'Amarillo' },
        { id:3, belt: 'Naranja' },
        { id:4, belt: 'Verde' },
        { id:5, belt: 'Azul' },
        { id:6, belt: 'Púrpura' },
        { id:7, belt: 'Marrón' },
        { id:8, belt: 'Negro' },
    ];

    const typesEventsToInsert = [
        {id: 1, type: 'Competencia' },
        {id: 2, type: 'Examen de Grado' }, 
        {id: 3, type: 'Seminario' }, 
        {id: 4, type: 'Exhibición' },
    ];

    const subtypesEventsToInsert = [
        {id: 1, type_id: 1, subtype: 'Oficial Federada (Nacional/Estadal)' },
        {id: 2, type_id: 1, subtype: 'Copa o Invitacional (Amistosa)' }, 
        {id: 3, type_id: 1, subtype: 'Liga de Élite (Serie)' }, 
        {id: 4, type_id: 1, subtype: 'Chequeo o Tope' },
        {id: 5, type_id: 2, subtype: 'Paso de Kyu (Colores)' },
        {id: 6, type_id: 2, subtype: 'Paso de Dan (Cinturón Negro)' },
        {id: 7, type_id: 2, subtype: 'Homologación de Grado' },
        {id: 8, type_id: 3, subtype: 'Técnico (Kata/Kumite)' },
        {id: 9, type_id: 3, subtype: 'Arbitraje' },
        {id: 10, type_id: 3, subtype: 'Capacitación para Coaches' },
        {id: 11, type_id: 3, subtype: 'Maestría (Gasshuku)' },
        {id: 12, type_id: 4, subtype: 'Promocional' },
        {id: 13, type_id: 4, subtype: 'Gala Marcial' },
        {id: 14, type_id: 4, subtype: 'Protocolar' }
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

        console.log('  -> 6/6: Insertando tipos de eventos (typesEvents)...');
        await db.insert(typesEventsTable)
            .values(typesEventsToInsert)
            .onConflictDoNothing({ 
                target: typesEventsTable.type // Usamos el campo 'type' para conflicto
            });
        console.log('✅ Types Events completado.');

        console.log('  -> 7/7: Insertando subtipos de eventos (subtypesEvents)...');
        await db.insert(subtypesEventsTable)
            .values(subtypesEventsToInsert)
            .onConflictDoNothing({ 
                target: [subtypesEventsTable.type_id, subtypesEventsTable.subtype]
            });
        console.log('✅ Subtypes Events completado.');

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