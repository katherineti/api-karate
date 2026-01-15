import { boolean, date, integer, jsonb, pgTable, serial, timestamp, unique, varchar } from "drizzle-orm/pg-core";

export const eventStatus_scheduled = 4;

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

export const karateCategoriesTable = pgTable("karate_categories",{
  id: serial().primaryKey(),
  category: varchar({ length: 255 }).notNull().unique(),
  age_range: varchar({ length: 100 }).notNull().unique(),
})

export const karateBeltsTable = pgTable("karate_belts",{
  id: serial().primaryKey(),
  belt: varchar({ length: 255 }).notNull().unique(),
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
    profile_picture: varchar({ length: 255 }).default(null),
    school_id: integer().default(null).references(() => schoolTable.id),
    // representative_id: integer().default(null),
    representative_id: jsonb('representative_id').$type<number[]>().default([]),
    status: integer().default(null).references(() => statusTable.id),
    roles_ids: jsonb('roles_ids').$type<number[]>().notNull().default([]),
    category_id: integer().default(null).references(() => karateCategoriesTable.id),
    belt_id: integer().default(null).references(() => karateBeltsTable.id),
    created_at: timestamp().defaultNow(),
    updated_at: timestamp().defaultNow(),
}, (table) => {
   return [
    unique('document_unique').on(table.document_type, table.document_number),
   ];
});

export const typesEventsTable = pgTable("types_events",{
  id: serial().primaryKey(),
  type: varchar({ length: 50 }).notNull().unique(),
})
export const subtypesEventsTable = pgTable("subtypes_events",{
  id: serial().primaryKey(),
  type_id: integer("type_id")
    .notNull()
    .references(() => typesEventsTable.id),
  subtype: varchar({ length: 50 }),
}, (table) => {
  return [
    // Crea una restricción única combinando ambas columnas
    unique("unique_subtype_per_type").on(table.type_id, table.subtype),
  ];
})

// Tabla: events (Reemplaza a competitionsTable)
// Propósito: Almacena los torneos, seminarios y eventos mayores del dashboard.
export const eventsTable = pgTable("events", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(), // Ej: "Campeonato Nacional Juvenil"
  description: varchar("description", { length: 500 }),
  date: date("date").notNull(),
  location: varchar("location", { length: 255 }),
  // Tipo de Evento (Competencia, Seminario, Exhibición, Examen de grado)
  // type_id: integer("type_id")
  //   .notNull()
  //   .references(() => typesEventsTable.id),
  subtype_id: integer("subtype_id"),
  // Estado (Programado, En Curso, Finalizado, Cancelado)
  status_id: integer("status_id")
    .notNull()
    .default(eventStatus_scheduled)
    .references(() => statusTable.id),
  max_evaluation_score: integer("max_evaluation_score").notNull().default(0),
  max_participants: integer("max_participants").notNull().default(0),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

//Puntuaciones
// Tabla: modalities
// Propósito: Lista maestra de los tipos de competencia (Forma, Combate, etc.)
export const modalitiesTable = pgTable("modalities", {
  id: serial("id").primaryKey(),
  // Almacena el nombre único de la modalidad (Ej: 'Forma Tradicional')
  name: varchar("name", { length: 255 }).notNull().unique(), 
});

// Tabla: scoring_divisions (Definición de Reglas de Puntuación)
// Propósito: Define una división sujeta a puntuación dentro de un Evento.
export const scoringDivisionsTable = pgTable("scoring_divisions", {
  id: serial("id").primaryKey(),
  
  // Conexión al EVENTO MAYOR (Ej: 'Torneo Regional')
  event_id: integer("event_id")
    .notNull()
    .references(() => eventsTable.id), 
  
  // Conexión a la división de edad/peso (Ej: Junior)
  karate_category_id: integer("karate_category_id")
    .notNull()
    .references(() => karateCategoriesTable.id),

  // NUEVA CLAVE FORÁNEA: Conexión a la Modalidad maestra
  modality_id: integer("modality_id") 
    .notNull()
    .references(() => modalitiesTable.id), 
  
  // Estado de la división de puntuación
  phase: varchar("phase", { length: 100 }).notNull().default('Clasificación'), 
  is_active: boolean("is_active").notNull().default(true),

  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
}, (table) => {
  return [
    // Restricción: No puede haber dos veces la misma modalidad para la misma categoría en el mismo evento.
    unique("unique_modality_per_event").on(table.event_id, table.karate_category_id, table.modality_id),
  ];
});

// Tabla: kata_performances (Ejecución de Kata)
// Propósito: Registra una única ejecución de Kata por un atleta en una ronda específica.
export const kataPerformancesTable = pgTable("kata_performances", {
  id: serial("id").primaryKey(),
  
  // Conexión a la regla de puntuación específica (Evento + Categoría + Modalidad).
  scoring_division_id: integer("scoring_division_id") 
    .notNull()
    .references(() => scoringDivisionsTable.id), 

  // Conexión al atleta que ejecutó el Kata.
  athlete_id: integer("athlete_id")
    .notNull()
    .references(() => usersTable.id), // Asumiendo que los atletas están en usersTable

  // El nombre del Kata ejecutado.
  kata_name: varchar("kata_name", { length: 255 }), 

  // Número de ronda.
  round_number: integer("round_number").notNull().default(1), 

  // Puntuación oficial final (entero, ya redondeado/truncado).
  final_score: integer("final_score").default(null), 

  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});