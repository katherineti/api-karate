"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersTable = exports.karateBeltsTable = exports.karateCategoriesTable = exports.schoolTable = exports.roleTable = exports.statusTable = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
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
});
exports.karateCategoriesTable = (0, pg_core_1.pgTable)("karate_categories", {
    id: (0, pg_core_1.serial)().primaryKey(),
    category: (0, pg_core_1.varchar)({ length: 255 }).notNull().unique(),
    age_range: (0, pg_core_1.varchar)({ length: 100 }).notNull().unique(),
});
exports.karateBeltsTable = (0, pg_core_1.pgTable)("karate_belts", {
    id: (0, pg_core_1.serial)().primaryKey(),
    belt: (0, pg_core_1.varchar)({ length: 255 }).notNull().unique(),
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
    created_at: (0, pg_core_1.timestamp)().defaultNow(),
    updated_at: (0, pg_core_1.timestamp)().defaultNow(),
}, (table) => {
    return [
        (0, pg_core_1.unique)('document_unique').on(table.document_type, table.document_number),
    ];
});
//# sourceMappingURL=schema.js.map