"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.participantRequestsTable = exports.requestStatusEnum = exports.notificationsTable = exports.tournamentRegistrationsTable = exports.kataPerformancesTable = exports.divisionJudgesTable = exports.judgeRoleEnum = exports.eventDivisionsTable = exports.eventCategoriesTable = exports.modalitiesTable = exports.eventsTable = exports.subtypesEventsTable = exports.typesEventsTable = exports.usersTable = exports.karateBeltsTable = exports.karateCategoriesTable = exports.schoolTable = exports.roleTable = exports.statusTable = exports.eventStatus_scheduled = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.eventStatus_scheduled = 4;
exports.statusTable = (0, pg_core_1.pgTable)("status", {
    id: (0, pg_core_1.serial)().primaryKey(),
    status: (0, pg_core_1.varchar)({ length: 255 }).notNull().unique(),
});
exports.roleTable = (0, pg_core_1.pgTable)("roles", {
    id: (0, pg_core_1.serial)().primaryKey(),
    name: (0, pg_core_1.varchar)({ length: 255 }).notNull().unique(),
});
exports.schoolTable = (0, pg_core_1.pgTable)("schools", {
    id: (0, pg_core_1.serial)().primaryKey(),
    name: (0, pg_core_1.varchar)({ length: 255 }).notNull().unique(),
    slug: (0, pg_core_1.varchar)({ length: 255 }).notNull().unique(),
    address: (0, pg_core_1.varchar)({ length: 500 }),
    base_score: (0, pg_core_1.integer)("base_score").default(0).notNull(),
    logo_url: (0, pg_core_1.varchar)({ length: 500 }).default(null),
    is_active: (0, pg_core_1.boolean)("is_active").default(true).notNull(),
    created_at: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updated_at: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
});
exports.karateCategoriesTable = (0, pg_core_1.pgTable)("karate_categories", {
    id: (0, pg_core_1.serial)().primaryKey(),
    category: (0, pg_core_1.varchar)({ length: 255 }).notNull(),
    age_range: (0, pg_core_1.varchar)({ length: 100 }).notNull(),
    allowed_belts: (0, pg_core_1.integer)("allowed_belts").array(),
}, (table) => {
    return [
        (0, pg_core_1.unique)("unique_category_age").on(table.category, table.age_range),
    ];
});
exports.karateBeltsTable = (0, pg_core_1.pgTable)("karate_belts", {
    id: (0, pg_core_1.serial)().primaryKey(),
    belt: (0, pg_core_1.varchar)({ length: 100 }).notNull().unique(),
    grade: (0, pg_core_1.varchar)("grade", { length: 50 }),
    rank_order: (0, pg_core_1.integer)("rank_order").notNull().unique(),
});
exports.usersTable = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.integer)().primaryKey().generatedAlwaysAsIdentity(),
    name: (0, pg_core_1.varchar)({ length: 255 }).default(null),
    lastname: (0, pg_core_1.varchar)({ length: 255 }).default(null),
    document_type: (0, pg_core_1.varchar)({ length: 1 }).default(null),
    document_number: (0, pg_core_1.varchar)({ length: 255 }).default(null),
    birthdate: (0, pg_core_1.date)().default(null),
    email: (0, pg_core_1.varchar)({ length: 255 }).notNull().unique(),
    password: (0, pg_core_1.varchar)({ length: 255 }).notNull(),
    profile_picture: (0, pg_core_1.varchar)({ length: 255 }).default(null),
    school_id: (0, pg_core_1.integer)().default(null).references(() => exports.schoolTable.id),
    representative_id: (0, pg_core_1.jsonb)('representative_id').$type().default([]),
    status: (0, pg_core_1.integer)().default(null).references(() => exports.statusTable.id),
    roles_ids: (0, pg_core_1.jsonb)('roles_ids').$type().notNull().default([]),
    category_id: (0, pg_core_1.integer)().default(null).references(() => exports.karateCategoriesTable.id),
    belt_id: (0, pg_core_1.integer)().default(null).references(() => exports.karateBeltsTable.id),
    certificate_front_url: (0, pg_core_1.varchar)("certificate_front_url", { length: 500 }),
    certificate_back_url: (0, pg_core_1.varchar)("certificate_back_url", { length: 500 }),
    master_photo_url: (0, pg_core_1.varchar)("master_photo_url", { length: 500 }),
    created_at: (0, pg_core_1.timestamp)().defaultNow(),
    updated_at: (0, pg_core_1.timestamp)().defaultNow(),
}, (table) => {
    return [
        (0, pg_core_1.unique)('document_unique').on(table.document_type, table.document_number),
        (0, pg_core_1.unique)('user_identity_triad_unique').on(table.email, table.document_type, table.document_number),
    ];
});
exports.typesEventsTable = (0, pg_core_1.pgTable)("types_events", {
    id: (0, pg_core_1.serial)().primaryKey(),
    type: (0, pg_core_1.varchar)({ length: 50 }).notNull().unique(),
});
exports.subtypesEventsTable = (0, pg_core_1.pgTable)("subtypes_events", {
    id: (0, pg_core_1.serial)().primaryKey(),
    type_id: (0, pg_core_1.integer)("type_id")
        .notNull()
        .references(() => exports.typesEventsTable.id),
    subtype: (0, pg_core_1.varchar)({ length: 50 }),
}, (table) => {
    return [
        (0, pg_core_1.unique)("unique_subtype_per_type").on(table.type_id, table.subtype),
    ];
});
exports.eventsTable = (0, pg_core_1.pgTable)("events", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.varchar)("name", { length: 255 }).notNull(),
    description: (0, pg_core_1.varchar)("description", { length: 500 }),
    date: (0, pg_core_1.date)("date").notNull(),
    location: (0, pg_core_1.varchar)("location", { length: 255 }),
    subtype_id: (0, pg_core_1.integer)("subtype_id")
        .notNull()
        .references(() => exports.subtypesEventsTable.id),
    status_id: (0, pg_core_1.integer)("status_id")
        .notNull()
        .default(exports.eventStatus_scheduled)
        .references(() => exports.statusTable.id),
    max_evaluation_score: (0, pg_core_1.integer)("max_evaluation_score").notNull().default(0),
    max_participants: (0, pg_core_1.integer)("max_participants").default(null),
    created_by: (0, pg_core_1.integer)("created_by").references(() => exports.usersTable.id),
    created_at: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updated_at: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.modalitiesTable = (0, pg_core_1.pgTable)("modalities", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.varchar)("name", { length: 255 }).notNull().unique(),
    type: (0, pg_core_1.varchar)("type", { length: 50 }).notNull(),
    style: (0, pg_core_1.varchar)('style', { length: 100 }),
    description: (0, pg_core_1.text)("description"),
});
exports.eventCategoriesTable = (0, pg_core_1.pgTable)("event_categories", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    event_id: (0, pg_core_1.integer)("event_id").notNull().references(() => exports.eventsTable.id),
    category_id: (0, pg_core_1.integer)("category_id").notNull().references(() => exports.karateCategoriesTable.id),
    is_active: (0, pg_core_1.boolean)("is_active").notNull().default(true),
    created_at: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updated_at: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
}, (table) => {
    return [
        (0, pg_core_1.unique)("unique_event_category").on(table.event_id, table.category_id),
    ];
});
exports.eventDivisionsTable = (0, pg_core_1.pgTable)("event_divisions", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    event_category_id: (0, pg_core_1.integer)("event_category_id")
        .notNull()
        .references(() => exports.eventCategoriesTable.id),
    modality_id: (0, pg_core_1.integer)("modality_id")
        .notNull()
        .references(() => exports.modalitiesTable.id),
    max_evaluation_score: (0, pg_core_1.integer)("max_evaluation_score").notNull().default(0),
    is_active: (0, pg_core_1.boolean)("is_active").notNull().default(true),
    created_at: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updated_at: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
}, (table) => {
    return [
        (0, pg_core_1.unique)("unique_event_cat_modality").on(table.event_category_id, table.modality_id),
    ];
});
exports.judgeRoleEnum = (0, pg_core_1.pgEnum)("judge_role", [
    "juez_central / arbitro",
    "juez_linea / juez_esquina",
    "anotador",
    "juez_suplente",
]);
exports.divisionJudgesTable = (0, pg_core_1.pgTable)("division_judges", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    division_id: (0, pg_core_1.integer)("division_id").references(() => exports.eventDivisionsTable.id),
    judge_id: (0, pg_core_1.integer)("judge_id").references(() => exports.usersTable.id),
    role_in_pool: (0, pg_core_1.varchar)("role_in_pool", { length: 50 }),
    is_active: (0, pg_core_1.boolean)("is_active").default(true),
    created_at: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updated_at: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
}, (table) => {
    return [
        (0, pg_core_1.unique)("unique_division_judge").on(table.division_id, table.judge_id),
    ];
});
exports.kataPerformancesTable = (0, pg_core_1.pgTable)("kata_performances", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    scoring_division_id: (0, pg_core_1.integer)("scoring_division_id")
        .notNull()
        .references(() => exports.eventDivisionsTable.id),
    athlete_id: (0, pg_core_1.integer)("athlete_id")
        .notNull()
        .references(() => exports.usersTable.id),
    kata_name: (0, pg_core_1.varchar)("kata_name", { length: 255 }),
    round_number: (0, pg_core_1.integer)("round_number").notNull().default(1),
    final_score: (0, pg_core_1.integer)("final_score").default(null),
    created_at: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updated_at: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.tournamentRegistrationsTable = (0, pg_core_1.pgTable)("tournament_registrations", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    athlete_id: (0, pg_core_1.integer)("athlete_id").references(() => exports.usersTable.id),
    division_id: (0, pg_core_1.integer)("division_id").references(() => exports.eventDivisionsTable.id),
    registration_date: (0, pg_core_1.timestamp)("registration_date").defaultNow(),
    status: (0, pg_core_1.varchar)("status", { length: 50 }).default('pendiente'),
}, (table) => {
    return [
        (0, pg_core_1.unique)("unique_registration").on(table.athlete_id, table.division_id),
    ];
});
exports.notificationsTable = (0, pg_core_1.pgTable)("notifications", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    sender_id: (0, pg_core_1.integer)("sender_id").references(() => exports.usersTable.id),
    recipient_id: (0, pg_core_1.integer)("recipient_id").references(() => exports.usersTable.id),
    event_id: (0, pg_core_1.integer)("event_id").references(() => exports.eventsTable.id),
    participant_requests_id: (0, pg_core_1.integer)("participant_requests_id").references(() => exports.participantRequestsTable.id),
    title: (0, pg_core_1.varchar)("title", { length: 255 }).notNull(),
    message: (0, pg_core_1.varchar)("message", { length: 1000 }),
    is_read: (0, pg_core_1.boolean)("is_read").default(false),
    created_at: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.requestStatusEnum = (0, pg_core_1.pgEnum)("participant_requests_status", [
    "pending",
    "approved",
    "rejected",
    "cancelled"
]);
exports.participantRequestsTable = (0, pg_core_1.pgTable)("participant_requests", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    event_id: (0, pg_core_1.integer)("event_id").notNull().references(() => exports.eventsTable.id),
    master_id: (0, pg_core_1.integer)("master_id").notNull().references(() => exports.usersTable.id),
    school_id: (0, pg_core_1.integer)("school_id").notNull().references(() => exports.schoolTable.id),
    num_participants_requested: (0, pg_core_1.integer)("num_participants_requested").notNull(),
    status: (0, exports.requestStatusEnum)("status").default("pending").notNull(),
    message: (0, pg_core_1.varchar)("message", { length: 500 }),
    created_at: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
//# sourceMappingURL=schema.js.map