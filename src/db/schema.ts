import { integer, jsonb, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";

export const statusTable = pgTable("status",{
  id: serial().primaryKey(),
  status: varchar({ length: 255 }).notNull().unique(),
})

export const roleTable = pgTable("roles",{
  id: serial().primaryKey(),
  name: varchar({ length: 255 }).notNull().unique() ,
})

export const schoolTable = pgTable("schools",{
  id: serial().primaryKey(),
  name: varchar({ length: 255 }).notNull().unique(), // Nombre amigable (con acentos/espacios)
  slug: varchar({ length: 255 }).notNull().unique(), // Identificador limpio (sin acentos/espacios)
})

export const usersTable = pgTable("users", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 255 }).default(null),
    lastname: varchar({ length: 255 }).default(null),
    // gender: varchar({ length: 1 }).notNull(), 
    birthdate: varchar().default(null),
    email: varchar({ length: 255 }).notNull().unique(),
    // username: varchar({ length: 255 }).notNull().unique(),
    password: varchar({ length: 255 }).notNull(),
    url_image: varchar({ length: 255 }).default(null),
    school_id: integer().default(null).references(() => schoolTable.id),
    status: integer().default(null).references(() => statusTable.id),
    // roles_id: integer().notNull().references(() => roleTable.id),
    roles_ids: jsonb('roles_ids').$type<number[]>().notNull().default([]),
    created_at: timestamp().defaultNow(),
    updated_at: timestamp().defaultNow(),
});

