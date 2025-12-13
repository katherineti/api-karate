import { date, integer, jsonb, pgTable, serial, timestamp, unique, varchar } from "drizzle-orm/pg-core";

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
    document_type: varchar({ length: 1 }).default(null),
    document_number: varchar({ length: 255 }).default(null), 
    birthdate: date().default(null),
    email: varchar({ length: 255 }).notNull().unique(),
    password: varchar({ length: 255 }).notNull(),
    url_image: varchar({ length: 255 }).default(null),
    school_id: integer().default(null).references(() => schoolTable.id),
    representative_id: integer().default(null),
    // representative_id: integer().default(null).references(() => usersTable.id),
    status: integer().default(null).references(() => statusTable.id),
    roles_ids: jsonb('roles_ids').$type<number[]>().notNull().default([]),
    created_at: timestamp().defaultNow(),
    updated_at: timestamp().defaultNow(),
}, (table) => {
   return [
    unique('document_unique').on(table.document_type, table.document_number),
   ];
});