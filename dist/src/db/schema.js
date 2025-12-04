"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersTable = exports.roleTable = exports.statusTable = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.statusTable = (0, pg_core_1.pgTable)("status", {
    id: (0, pg_core_1.serial)().primaryKey(),
    status: (0, pg_core_1.varchar)({ length: 255 }).notNull().unique(),
});
exports.roleTable = (0, pg_core_1.pgTable)("roles", {
    id: (0, pg_core_1.serial)().primaryKey(),
    name: (0, pg_core_1.varchar)({ length: 255 }).notNull().unique(),
});
exports.usersTable = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.integer)().primaryKey().generatedAlwaysAsIdentity(),
    name: (0, pg_core_1.varchar)({ length: 255 }).default(null),
    lastname: (0, pg_core_1.varchar)({ length: 255 }).default(null),
    birthdate: (0, pg_core_1.varchar)().default(null),
    email: (0, pg_core_1.varchar)({ length: 255 }).notNull().unique(),
    password: (0, pg_core_1.varchar)({ length: 255 }).notNull(),
    url_image: (0, pg_core_1.varchar)({ length: 255 }).default(null),
    status: (0, pg_core_1.integer)().default(null).references(() => exports.statusTable.id),
    roles_id: (0, pg_core_1.integer)().notNull().references(() => exports.roleTable.id),
    created_at: (0, pg_core_1.timestamp)().defaultNow(),
    updated_at: (0, pg_core_1.timestamp)().defaultNow(),
});
//# sourceMappingURL=schema.js.map