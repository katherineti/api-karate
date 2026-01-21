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
        { status: 'actualizado' },
        { status: 'Evento programado' },
        { status: 'Evento en curso' },
        { status: 'Evento finalizado' },
        { status: 'Evento cancelado' },
    ];
    const rawSchoolsData = [
        { slug: 'antonio-diaz-dojo', name: 'Antonio Díaz Dojo' },
        { slug: 'shito-ryu-karate', name: 'Shito-Ryu Karate' },
        { slug: 'dojo-okinawa', name: 'Dojo Okinawa' },
        { slug: 'bushido-vzla', name: 'Bushido Vzla' },
        { slug: 'shotokan-caracas', name: 'Shotokan Caracas' },
        { slug: 'gensei-ryu-miranda', name: 'Gensei-Ryu Miranda' },
        { slug: 'wado-ryu-valencia', name: 'Wado-Ryu Valencia' },
        { slug: 'kyokushin-maracay', name: 'Kyokushin Maracay' },
        { slug: 'shorin-ryu-barquisimeto', name: 'Shorin-Ryu Barquisimeto' },
        { slug: 'goju-ryu-merida', name: 'Goju-Ryu Mérida' },
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
        { id: 1, category: 'Hasta 5 años (mixto)', age_range: '0-5 años' },
        { id: 2, category: 'Infantil', age_range: '10-11 años' },
        { id: 3, category: 'Juvenil', age_range: '12-13 años' },
        { id: 4, category: 'Cadete', age_range: '14-15 años' },
        { id: 5, category: 'Junior', age_range: '16-17 años' },
        { id: 6, category: 'Sub-21', age_range: '18-20 años' },
        { id: 7, category: 'Senior', age_range: '21 años y más' },
    ];
    const karateBeltsToInsert = [
        { id: 1, belt: 'Blanco' },
        { id: 2, belt: 'Amarillo' },
        { id: 3, belt: 'Naranja' },
        { id: 4, belt: 'Verde' },
        { id: 5, belt: 'Azul' },
        { id: 6, belt: 'Púrpura' },
        { id: 7, belt: 'Marrón' },
        { id: 8, belt: 'Negro' },
    ];
    const typesEventsToInsert = [
        { id: 1, type: 'Competencia' },
        { id: 2, type: 'Examen de Grado' },
        { id: 3, type: 'Seminario' },
        { id: 4, type: 'Exhibición' },
    ];
    const subtypesEventsToInsert = [
        { id: 1, type_id: 1, subtype: 'Oficial Federada (Nacional/Estadal)' },
        { id: 2, type_id: 1, subtype: 'Copa o Invitacional (Amistosa)' },
        { id: 3, type_id: 1, subtype: 'Liga de Élite (Serie)' },
        { id: 4, type_id: 1, subtype: 'Chequeo o Tope' },
        { id: 5, type_id: 2, subtype: 'Paso de Kyu (Colores)' },
        { id: 6, type_id: 2, subtype: 'Paso de Dan (Cinturón Negro)' },
        { id: 7, type_id: 2, subtype: 'Homologación de Grado' },
        { id: 8, type_id: 3, subtype: 'Técnico (Kata/Kumite)' },
        { id: 9, type_id: 3, subtype: 'Arbitraje' },
        { id: 10, type_id: 3, subtype: 'Capacitación para Coaches' },
        { id: 11, type_id: 3, subtype: 'Maestría (Gasshuku)' },
        { id: 12, type_id: 4, subtype: 'Promocional' },
        { id: 13, type_id: 4, subtype: 'Gala Marcial' },
        { id: 14, type_id: 4, subtype: 'Protocolar' }
    ];
    const modalitiesToInsert = [
        { id: 1, name: 'Forma Tradicional', type: 'kata' },
        { id: 2, name: 'Forma con Armas', type: 'kata' },
        { id: 3, name: 'Formas Extremas', type: 'kata' },
        { id: 4, name: 'Kickboxing - Musical Forms', type: 'kata' },
        { id: 5, name: 'Combate Point Fighting', type: 'combate' },
        { id: 6, name: 'Kickboxing - Light Contact', type: 'combate' },
        { id: 7, name: 'Kickboxing - Full Contact', type: 'combate' },
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
        console.log('1: Iniciando seeding de roles (Autónomo)...');
        await db.insert(schema_1.roleTable)
            .values(rolesToInsert)
            .onConflictDoNothing({
            target: schema_1.roleTable.name
        });
        console.log('✅ Seeding de roles completado.');
        console.log('  -> 2: Insertando estados (status)...');
        await db.insert(schema_1.statusTable)
            .values(statusToInsert)
            .onConflictDoNothing({
            target: schema_1.statusTable.status
        });
        console.log('✅ Status completado.');
        console.log('  -> 3: Insertando escuelas (schools)...');
        await db.insert(schema_1.schoolTable)
            .values(schoolsToInsert)
            .onConflictDoNothing({ target: schema_1.schoolTable.slug });
        console.log(`✅ Schools completado. Se insertaron ${schoolsToInsert.length} escuelas.`);
        console.log('  -> 4: Insertando categorías de karate (karateCategories)...');
        await db.insert(schema_1.karateCategoriesTable)
            .values(karateCategoriesToInsert)
            .onConflictDoNothing({ target: [schema_1.karateCategoriesTable.category, schema_1.karateCategoriesTable.age_range] });
        console.log(`✅ Karate Categories completado. Se insertaron ${karateCategoriesToInsert.length} categorías.`);
        console.log('  -> 5: Insertando cinturones de karate (karateBelts)...');
        await db.insert(schema_1.karateBeltsTable)
            .values(karateBeltsToInsert)
            .onConflictDoNothing({ target: schema_1.karateBeltsTable.belt });
        console.log(`✅ Karate Belts completado. Se insertaron ${karateBeltsToInsert.length} cinturones.`);
        console.log('  -> 6: Insertando tipos de eventos (typesEvents)...');
        await db.insert(schema_1.typesEventsTable)
            .values(typesEventsToInsert)
            .onConflictDoNothing({
            target: schema_1.typesEventsTable.type
        });
        console.log('✅ Types Events completado.');
        console.log('  -> 7: Insertando subtipos de eventos (subtypesEvents)...');
        await db.insert(schema_1.subtypesEventsTable)
            .values(subtypesEventsToInsert)
            .onConflictDoNothing({
            target: [schema_1.subtypesEventsTable.type_id, schema_1.subtypesEventsTable.subtype]
        });
        console.log('✅ Subtypes Events completado.');
        console.log('  -> 8: Insertando modalidades (modalities)...');
        await db.insert(schema_1.modalitiesTable)
            .values(modalitiesToInsert)
            .onConflictDoNothing({
            target: schema_1.modalitiesTable.name
        });
        console.log('✅ Modalities completado.');
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