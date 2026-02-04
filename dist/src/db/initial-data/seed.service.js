"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.passw_hash = passw_hash;
const node_postgres_1 = require("drizzle-orm/node-postgres");
const pg_1 = require("pg");
require("dotenv/config");
const schema = require("../schema");
const schema_1 = require("../schema");
const argon2 = require("argon2");
const STATUS_ACTIVO = 1;
var RoleType;
(function (RoleType) {
    RoleType[RoleType["Admin"] = 1] = "Admin";
    RoleType[RoleType["Master"] = 2] = "Master";
    RoleType[RoleType["Juez"] = 3] = "Juez";
    RoleType[RoleType["Representante"] = 4] = "Representante";
    RoleType[RoleType["Alumno"] = 5] = "Alumno";
})(RoleType || (RoleType = {}));
async function passw_hash(password) {
    return await argon2.hash(password);
}
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
        { id: 1, status: 'activo' },
        { id: 2, status: 'inactivo' },
        { id: 3, status: 'actualizado' },
        { id: 4, status: 'Evento programado' },
        { id: 5, status: 'Evento en curso' },
        { id: 6, status: 'Evento finalizado' },
        { id: 7, status: 'Evento cancelado' },
    ];
    const rawSchoolsData = [
        { id: 1, slug: 'antonio-diaz-dojo', name: 'Antonio Díaz Dojo', address: 'caracas', base_score: 10, logo_url: 'uploads/image-1770156486595-341931470.jpg', is_active: true },
        { id: 2, slug: 'shito-ryu-karate', name: 'Shito-Ryu Karate', address: 'caracas', base_score: 10, logo_url: 'uploads/image-1770156533962-952722379.jpg', is_active: true },
        { id: 3, slug: 'dojo-okinawa', name: 'Dojo Okinawa', address: 'caracas', base_score: 10, logo_url: 'uploads/image-1770156551772-674652581.jpg', is_active: true },
        { id: 4, slug: 'bushido-vzla', name: 'Bushido Vzla', address: 'caracas', base_score: 10, logo_url: 'uploads/image-1770156580851-91741715.jpg', is_active: true },
        { id: 5, slug: 'shotokan-caracas', name: 'Shotokan Caracas', address: 'caracas', base_score: 10, logo_url: '', is_active: true },
        { id: 6, slug: 'gensei-ryu-miranda', name: 'Gensei-Ryu Miranda', address: 'caracas', base_score: 10, logo_url: '', is_active: true },
        { id: 7, slug: 'wado-ryu-valencia', name: 'Wado-Ryu Valencia', address: 'caracas', base_score: 10, logo_url: '', is_active: true },
        { id: 8, slug: 'kyokushin-maracay', name: 'Kyokushin Maracay', address: 'caracas', base_score: 10, logo_url: '', is_active: true },
        { id: 9, slug: 'shorin-ryu-barquisimeto', name: 'Shorin-Ryu Barquisimeto', address: 'caracas', base_score: 10, logo_url: '', is_active: true },
        { id: 10, slug: 'goju-ryu-merida', name: 'Goju-Ryu Mérida', address: 'caracas', base_score: 10, logo_url: '', is_active: true },
        { id: 11, slug: 'isshin-ryu-san-cristobal', name: 'Isshin-Ryu San Cristóbal', address: 'caracas', base_score: 10, logo_url: '', is_active: true },
        { id: 12, slug: 'kenpo-karate-zulia', name: 'Kenpo Karate Zulia', address: 'caracas', base_score: 10, logo_url: '', is_active: true },
        { id: 13, slug: 'ryuei-ryu-anzoategui', name: 'Ryuei-Ryu Anzoátegui', address: 'caracas', base_score: 10, logo_url: '', is_active: true },
        { id: 14, slug: 'shudokan-bolivar', name: 'Shudokan Bolívar', address: 'caracas', base_score: 10, logo_url: '', is_active: true },
        { id: 15, slug: 'yoshukai-sucre', name: 'Yoshukai Sucre', address: 'caracas', base_score: 10, logo_url: '', is_active: true },
    ];
    const schoolsToInsert = rawSchoolsData
        .filter(school => school.name && school.slug)
        .map(school => ({
        name: school.name.trim(),
        slug: school.slug.trim(),
    }));
    const karateCategoriesToInsert = [
        { id: 1, category: 'Hasta 5 años (mixto)', age_range: '0-5 años', allowed_belts: [1] },
        { id: 2, category: 'Infantil', age_range: '10-11 años', allowed_belts: [1] },
        { id: 3, category: 'Juvenil', age_range: '12-13 años', allowed_belts: [1] },
        { id: 4, category: 'Cadete', age_range: '14-15 años', allowed_belts: [1] },
        { id: 5, category: 'Junior', age_range: '16-17 años', allowed_belts: [1] },
        { id: 6, category: 'Sub-21', age_range: '18-20 años', allowed_belts: [1] },
        { id: 7, category: 'Senior', age_range: '21 años y más', allowed_belts: [1] },
    ];
    const karateBeltsToInsert = [
        { id: 1, belt: 'Blanco', grade: '1º Kyu', rank_order: 1 },
        { id: 2, belt: 'Amarillo', grade: '1º Kyu', rank_order: 2 },
        { id: 3, belt: 'Naranja', grade: '1º Kyu', rank_order: 3 },
        { id: 4, belt: 'Verde', grade: '1º Kyu', rank_order: 4 },
        { id: 5, belt: 'Azul', grade: '1º Kyu', rank_order: 5 },
        { id: 6, belt: 'Púrpura', grade: '1º Kyu', rank_order: 6 },
        { id: 7, belt: 'Marrón', grade: '1º Kyu', rank_order: 7 },
        { id: 8, belt: 'Negro', grade: '1º Kyu', rank_order: 8 },
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
        { id: 1, name: 'FORMA TRADICIONAL', type: 'kata', style: null, description: null },
        { id: 2, name: 'FORMA CON ARMAS', type: 'kata', style: null, description: null },
        { id: 3, name: 'FORMAS EXTREMAS', type: 'kata', style: null, description: null },
        { id: 4, name: 'FORMA MUSICAL', type: 'kata', style: null, description: null },
        { id: 5, name: 'COMBATE POINT FIGHTING', type: 'combate', style: null, description: null },
        { id: 6, name: 'KICKBOXING - LIGHT CONTACT', type: 'combate', style: null, description: null },
        { id: 7, name: 'KICKBOXING - FULL CONTACT', type: 'combate', style: null, description: null },
    ];
    const usersToInsert = [
        {
            name: 'Sanadmin',
            lastname: 'Castillo',
            document_type: 'V',
            document_number: '123456789',
            birthdate: '1990-01-01',
            email: 'admin@gmail.com',
            password: await passw_hash('12345678'),
            school_id: null,
            representative_id: null,
            status_id: 1,
            roles_ids: [RoleType.Admin],
            category_id: null,
            belt_id: null,
            status: STATUS_ACTIVO,
            certificate_front_url: null,
            certificate_back_url: null,
            master_photo_url: null,
        },
        {
            name: 'Juan',
            lastname: 'Castillo',
            document_type: 'V',
            document_number: '777777777',
            birthdate: '1995-02-03',
            email: 'master@gmail.com',
            password: await passw_hash('12345678'),
            school_id: 1,
            representative_id: null,
            status_id: 1,
            roles_ids: [RoleType.Master],
            category_id: 7,
            belt_id: null,
            status: STATUS_ACTIVO,
            certificate_front_url: null,
            certificate_back_url: null,
            master_photo_url: null,
        },
        {
            name: 'Juez Ricardo',
            lastname: 'Perez Sánchez.',
            document_type: 'E',
            document_number: '2222222',
            birthdate: '1988-08-01',
            email: 'juez@gmail.com',
            password: await passw_hash('12345678'),
            school_id: null,
            representative_id: null,
            status_id: 1,
            roles_ids: [RoleType.Juez],
            category_id: null,
            belt_id: null,
            status: STATUS_ACTIVO,
            certificate_front_url: null,
            certificate_back_url: null,
            master_photo_url: null,
        },
        {
            name: 'Jose',
            lastname: 'Doe',
            document_type: 'V',
            document_number: '9999799',
            birthdate: '1979-02-02',
            email: 'repre.jose@gmail.com',
            password: await passw_hash('12345678'),
            school_id: null,
            representative_id: null,
            status_id: 1,
            roles_ids: [RoleType.Representante],
            category_id: null,
            belt_id: null,
            status: STATUS_ACTIVO,
            certificate_front_url: null,
            certificate_back_url: null,
            master_photo_url: null,
        },
        {
            name: 'Maria',
            lastname: 'Doe',
            document_type: 'V',
            document_number: '111111111',
            birthdate: '1979-02-02',
            email: 'repre.maria@gmail.com',
            password: await passw_hash('12345678'),
            school_id: null,
            representative_id: null,
            status_id: 1,
            roles_ids: [RoleType.Representante],
            category_id: null,
            belt_id: null,
            status: STATUS_ACTIVO,
            certificate_front_url: null,
            certificate_back_url: null,
            master_photo_url: null,
        },
        {
            name: 'John',
            lastname: 'Doe',
            document_type: 'V',
            document_number: '54545454',
            birthdate: '1979-09-02',
            email: 'alumno@gmail.com',
            password: await passw_hash('12345678'),
            school_id: 2,
            representative_id: [4, 5],
            status_id: 1,
            roles_ids: [RoleType.Alumno],
            category_id: 6,
            belt_id: 4,
            status: STATUS_ACTIVO,
            certificate_front_url: null,
            certificate_back_url: null,
            master_photo_url: null,
        },
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
        console.log('  -> 4: Insertando cinturones de karate (karateBelts)...');
        await db.insert(schema_1.karateBeltsTable)
            .values(karateBeltsToInsert)
            .onConflictDoNothing({ target: schema_1.karateBeltsTable.belt });
        console.log(`✅ Karate Belts completado. Se insertaron ${karateBeltsToInsert.length} cinturones.`);
        console.log('  -> 5: Insertando categorías de karate (karateCategories)...');
        await db.insert(schema_1.karateCategoriesTable)
            .values(karateCategoriesToInsert)
            .onConflictDoNothing({ target: [schema_1.karateCategoriesTable.category, schema_1.karateCategoriesTable.age_range] });
        console.log(`✅ Karate Categories completado. Se insertaron ${karateCategoriesToInsert.length}pusers categorías.`);
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
        console.log('  -> 8: Insertando usuarios (users)...');
        await db.insert(schema_1.usersTable)
            .values(usersToInsert)
            .onConflictDoNothing({
            target: [schema_1.usersTable.email, schema_1.usersTable.document_type, schema_1.usersTable.document_number]
        });
        console.log('✅ Users completado.');
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