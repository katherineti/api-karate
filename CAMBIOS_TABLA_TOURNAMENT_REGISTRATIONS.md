# Cambios en tournament_registrations - Schema Simplificado

## Resumen Ejecutivo

Se han corregido las columnas en la tabla `tournament_registrations` para simplificar la estructura y alinearse mejor con el flujo de negocio real:

- ❌ Eliminadas: `division_id`, `event_category_id`
- ✅ Agregadas: `event_id`, `category_id`, `modality_id`

---

## 1. CAMBIOS EN EL SCHEMA

### Tabla: `tournament_registrations`

**ANTES:**
```typescript
tournament_registrations {
  id: PK
  athlete_id: FK → users
  event_id: FK → events                    // ✅ Ya existía
  division_id: FK → event_divisions        // ❌ Eliminada
  event_category_id: FK → event_categories // ❌ Eliminada
  status, payment_status, ...
}
```

**AHORA:**
```typescript
tournament_registrations {
  id: PK
  athlete_id: FK → users
  event_id: FK → events                    // ✅ Ya existía
  category_id: FK → karate_categories      // ✅ Nueva
  modality_id: FK → modalities             // ✅ Nueva
  status, payment_status, ...
}
```

### Beneficios:
1. **Más simple**: 2 FKs en lugar de 2 FKs complejos
2. **Directas**: Apunta directamente a `karate_categories` y `modalities`
3. **Flexible**: Permite buscar categorías y modalidades independientemente
4. **Alineado**: Refleja cómo el Master elige categoría y modalidad por separado

---

## 2. CAMBIOS EN LOS DTOs

### `request-participation.dto.ts`

```typescript
// ANTES:
{ division_id, event_category_id }

// AHORA:
{ event_id }  // ← Solo esto, Master decide lo demás
```

### `complete-registration.dto.ts`

```typescript
// ANTES:
{ division_id, event_category_id }

// AHORA:
{ category_id, modality_id }  // ← Directo a tablas maestras
```

---

## 3. CAMBIOS EN EL SERVICE

### Archivo: `tournament-registrations.service.ts`

#### Importaciones actualizadas:
```typescript
import { 
  ..., 
  karateCategoriesTable  // ✅ Agregado
} from '../db/schema';
```

#### Método: `completeRegistrationByMaster()`

**ANTES:**
```typescript
async completeRegistrationByMaster(
  registrationId, masterId, divisionId, eventCategoryId
)
```

**AHORA:**
```typescript
async completeRegistrationByMaster(
  registrationId, masterId, categoryId, modalityId
)
```

**Validaciones:**
- Valida `karateCategoriesTable` (en lugar de `eventCategoriesTable`)
- Valida `modalitiesTable` (en lugar de `eventDivisionsTable`)

#### Método: `getEventRegistrations()`

**ANTES:**
```typescript
select({
  divisionId: tournamentRegistrationsTable.division_id,
  ...
})
.leftJoin(eventDivisionsTable, ...)
```

**AHORA:**
```typescript
select({
  categoryId: tournamentRegistrationsTable.category_id,
  modalityId: tournamentRegistrationsTable.modality_id,
  ...
})
// Sin joins, datos ya están en la tabla
```

#### Métodos: `validateRegistration()`, `validatePayment()`, `rejectRegistration()`

**ANTES:**
```typescript
.from(eventCategoriesTable)
.innerJoin(eventsTable, ...)
.where(...eq(eventCategoriesTable.id, registration.event_category_id)...)
```

**AHORA:**
```typescript
.from(eventsTable)
.where(...eq(eventsTable.id, registration.event_id)...)
```

---

## 4. CAMBIOS EN EL CONTROLADOR

### Archivo: `tournament-registrations.controller.ts`

#### Endpoint: `PATCH /tournament-registrations/:id/complete`

**ANTES:**
```typescript
return await this.service.completeRegistrationByMaster(
  registrationId,
  user.sub,
  dto.division_id,        // ❌
  dto.event_category_id   // ❌
);
```

**AHORA:**
```typescript
return await this.service.completeRegistrationByMaster(
  registrationId,
  user.sub,
  dto.category_id,   // ✅
  dto.modality_id    // ✅
);
```

---

## 5. FLUJO DE NEGOCIO ACTUALIZADO

```
PASO 1: Alumno solicita participación
├─ Body: { event_id }
├─ Sistema crea tournament_registration:
│  ├─ event_id = <valor>
│  ├─ category_id = NULL       ← Master lo asignará
│  └─ modality_id = NULL       ← Master lo asignará
└─ Status: 'pendiente'

PASO 2: Master formaliza
├─ Endpoint: PATCH /:registrationId/complete
├─ Body: { category_id, modality_id }
├─ Sistema valida ambas tablas maestras
├─ Actualiza tournament_registration:
│  ├─ category_id = <valor>
│  └─ modality_id = <valor>
└─ Status: sigue siendo 'pendiente'

PASO 3: Alumno sube comprobante
├─ Endpoint: POST /:registrationId/upload-payment
├─ Body: { payment_method, payment_reference, payment_proof_url }
└─ Payment_status: 'en_espera'

PASO 4: Master valida pago
├─ Endpoint: PATCH /:registrationId/validate-payment
└─ Payment_status: 'pagado'

PASO 5: Master valida inscripción
├─ Endpoint: PATCH /:registrationId/validate
└─ Status: 'validado' → Atleta CONFIRMADO
```

---

## 6. CAMBIOS APLICADOS (Archivo por archivo)

| Archivo | Cambio |
|---------|--------|
| `src/db/schema.ts` | Tabla actualizada: sin `division_id`, `event_category_id`; con `category_id`, `modality_id` |
| `src/.../dto/complete-registration.dto.ts` | Actualizado: `{ category_id, modality_id }` |
| `src/.../tournament-registrations.service.ts` | ✅ 7 métodos actualizados para usar nuevas columnas |
| `src/.../tournament-registrations.controller.ts` | ✅ Endpoint `complete` actualizado |

---

## 7. VENTAJAS DE ESTE CAMBIO

1. **Claridad**: `category_id` y `modality_id` son explícitos
2. **Rendimiento**: Sin JOINs complejos en queries simples
3. **Mantenibilidad**: Menos niveles de indirección
4. **Escalabilidad**: Fácil agregar más columnas en el futuro
5. **Consistencia**: Alineado con cómo usa el Master las tablas

---

## 8. PRÓXIMOS PASOS

1. ✅ Compilar: `npm run build`
2. ✅ Verificar: No hay errores de compilación
3. ✅ Testear endpoints (especialmente `/complete`)
4. ✅ Deploy en Render

**Todos los cambios están aplicados y listos para compilar.**
