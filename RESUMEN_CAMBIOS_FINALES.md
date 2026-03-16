# Resumen Final: Corrección de tournament_registrations

## Lo que se corrigió

Se simplificó y clarificó la estructura de la tabla `tournament_registrations` eliminando referencias indirectas a `event_divisions` y `event_categories`, reemplazándolas por referencias directas a `karate_categories` y `modalities`.

---

## Cambios realizados

### 1. Schema (src/db/schema.ts)

```diff
export const tournamentRegistrationsTable = pgTable("tournament_registrations", {
  id: serial("id").primaryKey(),
  athlete_id: integer("athlete_id").notNull().references(() => usersTable.id),
  event_id: integer("event_id").notNull().references(() => eventsTable.id),
  
-  division_id: integer("division_id").references(() => eventDivisionsTable.id),
-  event_category_id: integer("event_category_id").references(() => eventCategoriesTable.id),
+  category_id: integer("category_id").references(() => karateCategoriesTable.id),
+  modality_id: integer("modality_id").references(() => modalitiesTable.id),
  
  // ... resto de columnas
```

**Razón**: Simplificar las relaciones y apuntar directamente a las tablas maestras.

---

### 2. DTO CompleteRegistrationDto (src/tournament-registrations/dto/complete-registration.dto.ts)

```diff
export class CompleteRegistrationDto {
  @IsNumber()
  @IsNotEmpty()
-  division_id: number;
+  category_id: number;

  @IsNumber()
  @IsNotEmpty()
-  event_category_id: number;
+  modality_id: number;
}
```

**Razón**: Reflejar las nuevas columnas que el Master debe asignar.

---

### 3. Service - Importaciones (src/tournament-registrations/tournament-registrations.service.ts)

```diff
import { 
  eventCategoriesTable, 
  eventDivisionsTable, 
  ...,
  eventsTable, 
  modalitiesTable,
+ karateCategoriesTable
} from '../db/schema';
```

**Razón**: Necesario para las validaciones en `completeRegistrationByMaster()`.

---

### 4. Service - Método completeRegistrationByMaster()

```diff
async completeRegistrationByMaster(
  registrationId: number,
  masterId: number,
- divisionId: number,
- eventCategoryId: number
+ categoryId: number,
+ modalityId: number
) {
  // ...
  
- // Validar que la división existe y está activa
- const [division] = await this.db
-   .select()
-   .from(eventDivisionsTable)
-   .where(and(
-     eq(eventDivisionsTable.id, divisionId),
-     eq(eventDivisionsTable.is_active, true)
-   ))
-   .limit(1);
+ // Validar que la categoría existe
+ const [category] = await this.db
+   .select()
+   .from(karateCategoriesTable)
+   .where(eq(karateCategoriesTable.id, categoryId))
+   .limit(1);

- // Validar que la categoría existe y está activa
- const [category] = await this.db
-   .select()
-   .from(eventCategoriesTable)
-   .where(and(
-     eq(eventCategoriesTable.id, eventCategoryId),
-     eq(eventCategoriesTable.is_active, true)
-   ))
-   .limit(1);
+ // Validar que la modalidad existe
+ const [modality] = await this.db
+   .select()
+   .from(modalitiesTable)
+   .where(eq(modalitiesTable.id, modalityId))
+   .limit(1);

  // Actualizar con los datos elegidos por el Master
  const [updated] = await this.db
    .update(tournamentRegistrationsTable)
    .set({
-     division_id: divisionId,
-     event_category_id: eventCategoryId,
+     category_id: categoryId,
+     modality_id: modalityId,
      master_validation_date: new Date(),
      updated_at: new Date(),
    })
    .where(eq(tournamentRegistrationsTable.id, registrationId))
    .returning();
}
```

**Razón**: Usar las nuevas columnas y validar las tablas correctas.

---

### 5. Service - Método getEventRegistrations()

```diff
const registrations = await this.db
  .select({
    id: tournamentRegistrationsTable.id,
    athleteId: tournamentRegistrationsTable.athlete_id,
    athleteName: sql`CONCAT(${usersTable.name}, ' ', ${usersTable.lastname})`,
    athleteEmail: usersTable.email,
-   divisionId: tournamentRegistrationsTable.division_id,
+   categoryId: tournamentRegistrationsTable.category_id,
+   modalityId: tournamentRegistrationsTable.modality_id,
    status: tournamentRegistrationsTable.status,
    // ...
  })
  .from(tournamentRegistrationsTable)
  .leftJoin(usersTable, eq(tournamentRegistrationsTable.athlete_id, usersTable.id))
- .leftJoin(eventDivisionsTable, eq(tournamentRegistrationsTable.division_id, eventDivisionsTable.id))
- .where(eq(eventCategoriesTable.event_id, eventId));
+ .where(eq(tournamentRegistrationsTable.event_id, eventId));
```

**Razón**: Simplificar la query eliminando JOINs innecesarios.

---

### 6. Service - Métodos validateRegistration(), validatePayment(), rejectRegistration()

```diff
// ANTES: Búsqueda indirecta
- const [event] = await this.db
-   .select()
-   .from(eventCategoriesTable)
-   .innerJoin(eventsTable, eq(eventCategoriesTable.event_id, eventsTable.id))
-   .where(and(
-     eq(eventCategoriesTable.id, registration.event_category_id),
-     eq(eventsTable.created_by, masterId)
-   ))
-   .limit(1);

// AHORA: Búsqueda directa
+ const [event] = await this.db
+   .select()
+   .from(eventsTable)
+   .where(and(
+     eq(eventsTable.id, registration.event_id),
+     eq(eventsTable.created_by, masterId)
+   ))
+   .limit(1);
```

**Razón**: Usar `event_id` directamente, no pasar por `event_category_id`.

---

### 7. Controller - Endpoint completeRegistration()

```diff
async completeRegistration(
  @Param('registrationId', ParseIntPipe) registrationId: number,
  @Body() dto: CompleteRegistrationDto,
  @Usersesion() user: IJwtPayload,
) {
  return await this.tournamentRegistrationsService.completeRegistrationByMaster(
    registrationId,
    user.sub,
-   dto.division_id,
-   dto.event_category_id
+   dto.category_id,
+   dto.modality_id
  );
}
```

**Razón**: Pasar los nuevos parámetros del DTO al servicio.

---

## Beneficios de estos cambios

1. **Claridad**: Las columnas son auto-explicativas (`category_id`, `modality_id`)
2. **Rendimiento**: Sin JOINs complejos en queries simples
3. **Mantenibilidad**: Menos niveles de indirección
4. **Corrección**: Alineado con el flujo real de negocio
5. **Simpleza**: Menos confusión sobre qué representa cada columna

---

## Flujo ahora es:

1. **Alumno** envía: `{ event_id }`
2. **Master** ve la solicitud y elige: `{ category_id, modality_id }`
3. **Sistema** registra ambos valores
4. **Alumno** carga comprobante
5. **Master** valida pago
6. **Alumno** confirmado

---

## Estado: ✅ Listo

Todos los archivos han sido actualizados. Puedes compilar y probar:

```bash
npm run build
```

Si tienes errores de compilación, verifica que:
- Los IDs de rol sean correctos (Master=2, Alumno=5)
- Las tablas maestras existan en la BD
- Los guards de autenticación estén bien configurados
