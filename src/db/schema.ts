import { boolean, date, integer, jsonb, pgEnum, pgTable, serial, timestamp, unique, varchar } from "drizzle-orm/pg-core";

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
  category: varchar({ length: 255 }).notNull(),
  age_range: varchar({ length: 100 }).notNull(),
  // Nueva Columna: Arreglo de IDs de cinturones
  // Referencia a los IDs de la tabla karateBeltsTable
  allowed_belts: integer("allowed_belts").array(),
}, (table) => {
  return [
    // Definimos que la COMBINACIÓN de ambos debe ser única
    unique("unique_category_age").on(table.category, table.age_range),
  ];
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
  subtype_id: integer("subtype_id")
    .notNull()
    .references(() => subtypesEventsTable.id),
  // Estado (Programado, En Curso, Finalizado, Cancelado)
  status_id: integer("status_id")
    .notNull()
    .default(eventStatus_scheduled)
    .references(() => statusTable.id),
  max_evaluation_score: integer("max_evaluation_score").notNull().default(0),
  max_participants: integer("max_participants").notNull().default(0),
  created_by: integer("created_by").references(() => usersTable.id),
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
  type: varchar("type", { length: 50 }).notNull(), // 'kata' o 'combate'
});

// 1. Nueva tabla para registrar categorías en un evento
export const eventCategoriesTable = pgTable("event_categories", {
  id: serial("id").primaryKey(),
  event_id: integer("event_id").notNull().references(() => eventsTable.id),
  category_id: integer("category_id").notNull().references(() => karateCategoriesTable.id),
  is_active: boolean("is_active").notNull().default(true), // Estado global de la categoría
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
}, (table) => {
  return [
    unique("unique_event_category").on(table.event_id, table.category_id),
  ]
}
);

// Tabla: scoring_divisions (Definición de Reglas de Puntuación)
// Propósito: Define una división sujeta a puntuación dentro de un Evento.
// export const eventDivisionsTable = pgTable("scoring_divisions", {
export const eventDivisionsTable = pgTable("event_divisions", {
  id: serial("id").primaryKey(),

// Ahora apuntamos a la relación anterior
  event_category_id: integer("event_category_id")
    .notNull()
    .references(() => eventCategoriesTable.id),
  
/*   // Conexión al EVENTO MAYOR (Ej: 'Torneo Regional')
  event_id: integer("event_id")
    .notNull()
    .references(() => eventsTable.id), 
  
  // Conexión a la división de edad/peso (Ej: Junior)
  category_id: integer("category_id")
    .notNull()
    .references(() => karateCategoriesTable.id), */
    
    // NUEVA CLAVE FORÁNEA: Conexión a la Modalidad maestra
    modality_id: integer("modality_id") 
    .notNull()
    .references(() => modalitiesTable.id), 
    
    max_evaluation_score: integer("max_evaluation_score").notNull().default(0),
    
/*   // Estado general de la categoría dentro del evento
  category_is_active: boolean("category_is_active").default(true), */
  // phase: varchar("phase", { length: 100 }).notNull().default('Clasificación'), 
  // Estado de la división de puntuació: Estado específico de la modalidad en esta categoría
  is_active: boolean("is_active").notNull().default(true),

  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
}, (table) => {
  return [
    // Restricción: No puede haber dos veces la misma modalidad para la misma categoría en el mismo evento.
    // unique("unique_modality_per_event").on(table.event_id, table.category_id, table.modality_id),
    unique("unique_event_cat_modality").on(table.event_category_id, table.modality_id),
  ];
});

// Definir los roles posibles para el panel de jueces
export const judgeRoleEnum = pgEnum("judge_role", [
  "juez_central / arbitro", 
  "juez_linea / juez_esquina", 
  "anotador", 
  "juez_suplente", 
]);
//Asignación de Jueces a Modalidades
export const divisionJudgesTable = pgTable("division_judges", {
  id: serial("id").primaryKey(),
  division_id: integer("division_id").references(() => eventDivisionsTable.id),
  judge_id: integer("judge_id").references(() => usersTable.id), 
  role_in_pool: varchar("role_in_pool", { length: 50 }), // 'principal', 'asistente'
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
}, (table) => {
  return [
    // Aseguramos que no se repita el mismo juez en la misma división
    unique("unique_division_judge").on(table.division_id, table.judge_id),
  ];
});


// Tabla: kata_performances (Ejecución de Kata)
// Propósito: Registra una única ejecución de Kata por un atleta en una ronda específica.
export const kataPerformancesTable = pgTable("kata_performances", {
  id: serial("id").primaryKey(),
  // Conexión a la regla de puntuación específica (Evento + Categoría + Modalidad).
  scoring_division_id: integer("scoring_division_id") 
    .notNull()
    .references(() => eventDivisionsTable.id), 
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

//Inscripciones (Atleta en Categoría diferente): Para permitir que un atleta se inscriba en una categoría distinta a la de su perfil
export const tournamentRegistrationsTable = pgTable("tournament_registrations", {
  id: serial("id").primaryKey(),
  athlete_id: integer("athlete_id").references(() => usersTable.id),
  division_id: integer("division_id").references(() => eventDivisionsTable.id),
  registration_date: timestamp("registration_date").defaultNow(),
  // Aquí ignoramos la category_id del perfil del usuario y usamos la de division_id
  status: varchar("status", { length: 50 }).default('pendiente'), // pendiente, confirmado, cancelado
}, (table) => {
  return [
    // Evita duplicados: Un atleta no puede inscribirse dos veces a la misma categoría/modalidad del mismo evento
    unique("unique_registration").on(table.athlete_id, table.division_id),
  ];
});

//notificaciones a los masters
export const notificationsTable = pgTable("notifications", {
  id: serial("id").primaryKey(),
  sender_id: integer("sender_id").references(() => usersTable.id), //responsable de la notificación
  recipient_id: integer("recipient_id").references(() => usersTable.id), // El Master receptor de la notificacion
  event_id: integer("event_id").references(() => eventsTable.id),       // El Evento
  title: varchar("title", { length: 255 }).notNull(),
  message: varchar("message", { length: 1000 }),
  is_read: boolean("is_read").default(false),
  created_at: timestamp("created_at").defaultNow(),
});

// schema.ts
export const participantRequestsTable = pgTable("participant_requests", {
  id: serial("id").primaryKey(),
  event_id: integer("event_id").notNull().references(() => eventsTable.id),
  master_id: integer("master_id").notNull().references(() => usersTable.id),
  school_id: integer("school_id").notNull().references(() => schoolTable.id),
  // Nuevo nombre de columna 👇
  num_participants_requested: integer("num_participants_requested").notNull(), 
  status: varchar("status", { length: 20 }).default('pending'), 
  message: varchar("message", { length: 500 }),
  created_at: timestamp("created_at").defaultNow(),
});