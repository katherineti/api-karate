# ✅ RESPUESTA A TUS PREGUNTAS

## Pregunta 1: ¿Cuál es el endpoint para que el alumno solicite inscripción?

### ✅ Respuesta:
```
POST /tournament-registrations/request-participation

Body:
{
  "event_id": 1
}

Respuesta:
{
  "success": true,
  "message": "Solicitud de participación creada. Espera a que el Master revise tu solicitud.",
  "data": {
    "id": 42,
    "athlete_id": 10,
    "event_id": 1,
    "division_id": null,        ← NULL hasta que Master lo asigne
    "event_category_id": null,  ← NULL hasta que Master lo asigne
    "status": "pendiente",
    "payment_status": "no_pagado"
  }
}
```

---

## Pregunta 2: ¿Cuál es el endpoint donde el Master agrega categoría y modalidad?

### ✅ Respuesta:
```
PATCH /tournament-registrations/:registrationId/complete

Parámetro: registrationId = 42

Body:
{
  "division_id": 5,           ← Modalidad elegida por Master
  "event_category_id": 2      ← Categoría elegida por Master
}

Respuesta:
{
  "success": true,
  "message": "Inscripción completada. Ahora el alumno debe subir su comprobante de pago.",
  "data": {
    "id": 42,
    "athlete_id": 10,
    "event_id": 1,
    "division_id": 5,           ← ✅ Ahora tiene valor
    "event_category_id": 2,     ← ✅ Ahora tiene valor
    "status": "pendiente",      ← Sigue siendo pendiente (espera pago)
    "payment_status": "no_pagado",
    "master_validation_date": "2026-03-16T14:30:00Z"
  }
}
```

---

## Cambios en la Tabla

### Antes (INCORRECTO):
```sql
CREATE TABLE tournament_registrations (
  id INTEGER PRIMARY KEY,
  athlete_id INTEGER NOT NULL,
  division_id INTEGER NOT NULL,          ❌ Obligatorio desde el inicio
  event_category_id INTEGER NOT NULL,    ❌ Obligatorio desde el inicio
  status VARCHAR,
  payment_status VARCHAR,
  ...
);

UNIQUE CONSTRAINT: (athlete_id, division_id)  ❌ Incorrecto
```

### Ahora (CORRECTO):
```sql
CREATE TABLE tournament_registrations (
  id INTEGER PRIMARY KEY,
  athlete_id INTEGER NOT NULL,
  event_id INTEGER NOT NULL,              ✅ NUEVO - Lo que necesita el alumno
  division_id INTEGER NULL,               ✅ NULL hasta que Master lo asigne
  event_category_id INTEGER NULL,         ✅ NULL hasta que Master lo asigne
  status VARCHAR,
  payment_status VARCHAR,
  ...
);

UNIQUE CONSTRAINT: (athlete_id, event_id)  ✅ Correcto
```

---

## Flujo Completo Actualizado

```
1️⃣ ALUMNO: "Quiero participar en el evento"
   └─ POST /request-participation { event_id: 1 }
   └─ division_id = NULL
   └─ event_category_id = NULL
   └─ Status: pendiente

        ↓ Master revisa

2️⃣ MASTER: "Decidí que vas a participar en Categoría Juvenil, Modalidad Kata"
   └─ PATCH /:id/complete { division_id: 5, event_category_id: 2 }
   └─ division_id = 5 ✅
   └─ event_category_id = 2 ✅
   └─ Status: pendiente (espera pago)

        ↓ Alumno paga

3️⃣ ALUMNO: Sube comprobante de pago
   └─ POST /:id/upload-payment { payment_method: "digital", payment_reference: "...", payment_proof_url: "..." }
   └─ payment_status: "en_espera"

        ↓ Master valida

4️⃣ MASTER: Valida el pago
   └─ PATCH /:id/validate-payment
   └─ payment_status: "pagado"
   └─ Status: "validado"

   ✅ ALUMNO INSCRITO CONFIRMADO EN: evento + categoría + modalidad
```

---

## Cambios en el Código

### DTO request-participation.dto.ts
```typescript
// ANTES ❌
export class RequestParticipationDto {
  division_id: number;
  event_category_id: number;
}

// AHORA ✅
export class RequestParticipationDto {
  event_id: number;  // Solo esto
}
```

### Service method createParticipationRequest()
```typescript
// ANTES ❌
async createParticipationRequest(
  athleteId: number,
  divisionId: number,          // No necesario aquí
  eventCategoryId: number      // No necesario aquí
)

// AHORA ✅
async createParticipationRequest(
  athleteId: number,
  eventId: number  // Suficiente
)
```

### Service NEW method completeRegistrationByMaster()
```typescript
// NUEVO ✅
async completeRegistrationByMaster(
  registrationId: number,
  masterId: number,
  divisionId: number,          // Master elige
  eventCategoryId: number      // Master elige
)
```

### Controller endpoint request-participation
```typescript
// ANTES ❌
@Post('request-participation')
async requestParticipation(
  @Body() dto: RequestParticipationDto,
  @Usersesion() user: IJwtPayload,
) {
  return this.tournamentRegistrationsService.createParticipationRequest(
    user.sub,
    dto.division_id,        ❌ No tenía
    dto.event_category_id   ❌ No tenía
  );
}

// AHORA ✅
@Post('request-participation')
async requestParticipation(
  @Body() dto: RequestParticipationDto,
  @Usersesion() user: IJwtPayload,
) {
  return this.tournamentRegistrationsService.createParticipationRequest(
    user.sub,
    dto.event_id  ✅ Correcto
  );
}
```

### Controller NEW endpoint complete-registration
```typescript
// NUEVO ✅
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

## Resumen de Análisis

✅ **Problema identificado**: El alumno no debería elegir categoría ni modalidad al solicitar

✅ **Solución implementada**: 
- Alumno solo envía `event_id`
- Master formaliza después y elige `division_id` + `event_category_id`

✅ **Cambios realizados**:
1. Schema: `division_id` y `event_category_id` son ahora NULLABLE
2. DTO: Solo `event_id` en solicitud
3. Service: Nuevo método `completeRegistrationByMaster()`
4. Controller: Nuevo endpoint `PATCH /:id/complete`

✅ **Flujo ahora correcto**: Solicitud → Formalización → Pago → Validación → Confirmado
