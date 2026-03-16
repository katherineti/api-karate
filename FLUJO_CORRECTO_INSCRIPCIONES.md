# 📋 FLUJO CORRECTO DE INSCRIPCIONES (CORREGIDO)

## El Problema

Implementé un sistema donde el **alumno elegía categoría y modalidad al solicitar**. Pero el flujo real es:
- **Alumno**: Solo dice "quiero participar en el evento"
- **Master**: Elige la categoría y modalidad después de revisar

---

## El Flujo Correcto (Ahora Implementado)

```
┌─────────────────────────────────────────────────────────────┐
│ PASO 1: ALUMNO SOLICITA PARTICIPACIÓN                       │
├─────────────────────────────────────────────────────────────┤
│ Endpoint: POST /tournament-registrations/request-participation
│ Body: { event_id: 1 }                                       │
│                                                              │
│ ¿Qué pasa?                                                   │
│ • Se crea registration con:                                 │
│   - athlete_id: ID del alumno                               │
│   - event_id: El evento (OBLIGATORIO)                       │
│   - division_id: NULL (aún no elegido)                      │
│   - event_category_id: NULL (aún no elegido)                │
│   - status: "pendiente"                                     │
│   - payment_status: "no_pagado"                             │
│                                                              │
│ ✅ Alumno ve en dashboard: "Solicitud pendiente"            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ PASO 2: MASTER FORMALIZA (AQUÍ ELIGE CATEGORÍA Y MODALIDAD)│
├─────────────────────────────────────────────────────────────┤
│ Endpoint: PATCH /tournament-registrations/:id/complete     │
│ Body: {                                                      │
│   division_id: 5,          // Modalidad elegida por Master   │
│   event_category_id: 2     // Categoría elegida por Master   │
│ }                                                            │
│                                                              │
│ ¿Qué pasa?                                                   │
│ • Master revisa si el alumno es apto                        │
│ • Master selecciona: Categoría (ej: Juvenil) + Modalidad    │
│ • Se actualiza registration con:                            │
│   - division_id: 5 (la elegida)                             │
│   - event_category_id: 2 (la elegida)                       │
│   - master_validation_date: ahora                           │
│                                                              │
│ ✅ Status sigue siendo "pendiente"                          │
│ ✅ Alumno ahora sabe dónde participará                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ PASO 3: ALUMNO PAGA                                         │
├─────────────────────────────────────────────────────────────┤
│ Endpoint: POST /tournament-registrations/:id/upload-payment │
│ Body: {                                                      │
│   payment_method: "digital" | "efectivo",                  │
│   payment_reference: "número de referencia",               │
│   payment_proof_url: "url de captura" (si es digital)      │
│ }                                                            │
│                                                              │
│ ¿Qué pasa?                                                   │
│ • Se actualiza registration con:                            │
│   - payment_method: digital                                 │
│   - payment_reference: ref123456                            │
│   - payment_proof_url: url...                               │
│   - payment_date: ahora                                     │
│   - payment_status: "en_espera" (esperando validación)      │
│                                                              │
│ ✅ Alumno ve: "Pago pendiente de validación"                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ PASO 4: MASTER VALIDA PAGO                                  │
├─────────────────────────────────────────────────────────────┤
│ Endpoint: PATCH /tournament-registrations/:id/validate-payment
│                                                              │
│ ¿Qué pasa?                                                   │
│ • Master verifica el comprobante                            │
│ • Se actualiza registration con:                            │
│   - payment_status: "pagado"                                │
│   - status: "validado" (inscripción completa)               │
│                                                              │
│ ✅ Alumno está CONFIRMADO para competir                     │
│ ✅ Sabe: evento + categoría + modalidad + pago              │
└─────────────────────────────────────────────────────────────┘
```

---

## Cambios Realizados

### 1. Schema (tournament_registrations)

**Antes:**
```sql
- athlete_id (NOT NULL)
- division_id (NOT NULL)        ❌ Obligatorio
- event_category_id (NOT NULL)  ❌ Obligatorio
- status (NOT NULL)
- payment_status (NOT NULL)
```

**Ahora:**
```sql
- athlete_id (NOT NULL)
- event_id (NOT NULL)           ✅ NUEVO - El evento al que solicita
- division_id (NULLABLE)        ✅ NULL hasta que Master lo asigne
- event_category_id (NULLABLE)  ✅ NULL hasta que Master lo asigne
- status (NOT NULL)
- payment_status (NOT NULL)
```

**Índice único actualizado:**
```sql
BEFORE: unique(athlete_id, division_id)      ❌ Incorrecto
AFTER:  unique(athlete_id, event_id)         ✅ Correcto
```

---

### 2. DTOs

#### ✅ `request-participation.dto.ts` (Corregido)
```typescript
export class RequestParticipationDto {
  @IsNumber()
  @IsNotEmpty()
  event_id: number;  // ✅ SOLO event_id, nada más
}
```

**¿Para qué?** Alumno dice: "Quiero participar en el evento X"

---

#### ✅ `complete-registration.dto.ts` (NUEVO)
```typescript
export class CompleteRegistrationDto {
  @IsNumber()
  @IsNotEmpty()
  division_id: number;        // Modalidad elegida por Master

  @IsNumber()
  @IsNotEmpty()
  event_category_id: number;  // Categoría elegida por Master
}
```

**¿Para qué?** Master dice: "Este alumno participará en la categoría X, modalidad Y"

---

### 3. Service (tournament-registrations.service.ts)

#### ✅ Método 1: `createParticipationRequest()` (Corregido)
```typescript
async createParticipationRequest(athleteId: number, eventId: number) {
  // Validar evento existe
  // Validar alumno no tiene solicitud para este evento
  // Crear con event_id, division_id=null, event_category_id=null
  // Status: "pendiente"
  // Payment_status: "no_pagado"
}
```

**¿Para qué?** Alumno solicita participación

---

#### ✅ Método 1B: `completeRegistrationByMaster()` (NUEVO)
```typescript
async completeRegistrationByMaster(
  registrationId: number,
  masterId: number,
  divisionId: number,
  eventCategoryId: number
) {
  // Validar registration existe y status="pendiente"
  // Validar Master es creador del evento
  // Validar división existe y está activa
  // Validar categoría existe y está activa
  // Actualizar: division_id, event_category_id, master_validation_date
}
```

**¿Para qué?** Master formaliza y elige categoría + modalidad

---

### 4. Controlador (tournament-registrations.controller.ts)

#### ✅ Endpoint 1: `POST /request-participation` (Corregido)
```typescript
@Post('request-participation')
@Roles(5)  // Alumno
async requestParticipation(
  @Body() dto: RequestParticipationDto,  // { event_id }
  @Usersesion() user: IJwtPayload,
) {
  return this.tournamentRegistrationsService.createParticipationRequest(
    user.sub,
    dto.event_id  // ✅ Solo event_id
  );
}
```

---

#### ✅ Endpoint 1B: `PATCH /:id/complete` (NUEVO)
```typescript
@Patch(':registrationId/complete')
@Roles(2)  // Master
async completeRegistration(
  @Param('registrationId') registrationId: number,
  @Body() dto: CompleteRegistrationDto,  // { division_id, event_category_id }
  @Usersesion() user: IJwtPayload,
) {
  return this.tournamentRegistrationsService.completeRegistrationByMaster(
    registrationId,
    user.sub,
    dto.division_id,
    dto.event_category_id
  );
}
```

---

## Estados de la Inscripción

```
ALUMNO solicita
    ↓
registration.status = "pendiente"
registration.division_id = NULL
registration.event_category_id = NULL
registration.payment_status = "no_pagado"
    ↓
MASTER formaliza (elige categoría y modalidad)
    ↓
registration.status = "pendiente" (sigue)
registration.division_id = 5 ✅ (asignado)
registration.event_category_id = 2 ✅ (asignado)
registration.payment_status = "no_pagado" (sigue)
    ↓
ALUMNO paga
    ↓
registration.payment_status = "en_espera" (Master revisa)
registration.payment_method = "digital"
registration.payment_reference = "ref123"
    ↓
MASTER valida pago
    ↓
registration.status = "validado" ✅
registration.payment_status = "pagado" ✅
    ↓
✅ ALUMNO CONFIRMADO PARA COMPETIR
```

---

## Resumen de Cambios

| Aspecto | Antes | Ahora |
|---------|-------|-------|
| Schema | division_id NOT NULL | division_id NULLABLE |
| Schema | event_category_id NOT NULL | event_category_id NULLABLE |
| Schema | Sin event_id | event_id NUEVO |
| Índice | unique(athlete_id, division_id) | unique(athlete_id, event_id) |
| Solicitud | Alumno elige categoría | Alumno solo elige evento |
| Formalización | No existía | ✅ Master elige categoría+modalidad |
| Endpoint | POST /request-participation | ✅ Corregido |
| Endpoint nuevo | N/A | ✅ PATCH /:id/complete |

---

## Próximos Pasos

1. ✅ Cambios aplicados en Schema
2. ✅ DTOs actualizados
3. ✅ Service actualizado
4. ✅ Controller actualizado
5. ⏳ Compilar: `npm run build`
6. ⏳ Probar endpoints
7. ⏳ Deploy

---

## Endpoints Finales

### Para Alumno:
- `POST /tournament-registrations/request-participation` - Solicitar participación
- `POST /tournament-registrations/:id/upload-payment` - Subir comprobante
- `GET /tournament-registrations/athlete/my-events` - Ver eventos + estado inscripción

### Para Master:
- `GET /tournament-registrations/event/:eventId/registrations` - Ver solicitudes
- `PATCH /tournament-registrations/:id/complete` - **Formalizar y elegir categoría**
- `PATCH /tournament-registrations/:id/validate-payment` - Validar pago
- `PATCH /tournament-registrations/:id/reject` - Rechazar solicitud
