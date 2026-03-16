# 🎯 ACCIONES A REALIZAR

## Archivos Modificados ✅

Todos estos archivos YA FUERON ACTUALIZADOS:

| # | Archivo | Cambio |
|---|---------|--------|
| 1 | `src/db/schema.ts` | ✅ Schema corregido |
| 2 | `src/tournament-registrations/dto/request-participation.dto.ts` | ✅ Corregido |
| 3 | `src/tournament-registrations/dto/complete-registration.dto.ts` | ✅ NUEVO |
| 4 | `src/tournament-registrations/tournament-registrations.service.ts` | ✅ Métodos actualizados |
| 5 | `src/tournament-registrations/tournament-registrations.controller.ts` | ✅ Endpoints actualizados |

---

## Verificaciones Manuales

### 1. Verificar que imports están correctos en Controller

**Archivo**: `src/tournament-registrations/tournament-registrations.controller.ts`

**Línea 6 debe tener:**
```typescript
import { CompleteRegistrationDto } from './dto/complete-registration.dto';
```

✅ **Estado**: Ya fue agregado automáticamente

---

### 2. Verificar que los Roles IDs son correctos

**Archivo**: `src/tournament-registrations/tournament-registrations.controller.ts`

**En los endpoints busca:**
```typescript
@Roles(5)  // Para endpoints de ALUMNO
@Roles(2)  // Para endpoints de MASTER
```

**Si los IDs de roles son diferentes en tu sistema:**
- Busca: `src/constants.ts` o `src/db/schema.ts` para encontrar los IDs reales
- Reemplaza en los decoradores `@Roles()`

---

### 3. Compilar el proyecto

```bash
npm run build
```

**¿Qué debe pasar?**
- ✅ Debe compilar sin errores
- ⚠️ Si hay errores, son probablemente por los IDs de roles

**Posibles errores y soluciones:**

| Error | Causa | Solución |
|-------|-------|----------|
| `Cannot find name 'eventsTable'` | Falta import | Verificar imports al inicio del service |
| `Property 'event_id' does not exist` | Schema no sincronizado | Limpiar cache: `rm -rf node_modules/.drizzle` |
| Otros errores de tipos | IDEs desfasados | Hacer `npm install` nuevamente |

---

## Probar los Endpoints

### Test 1: Alumno solicita participación

```bash
curl -X POST http://localhost:3000/tournament-registrations/request-participation \
  -H "Authorization: Bearer {token_alumno}" \
  -H "Content-Type: application/json" \
  -d '{ "event_id": 1 }'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Solicitud de participación creada...",
  "data": {
    "id": 42,
    "athlete_id": 10,
    "event_id": 1,
    "division_id": null,
    "event_category_id": null,
    "status": "pendiente",
    "payment_status": "no_pagado"
  }
}
```

---

### Test 2: Master formaliza inscripción

```bash
curl -X PATCH http://localhost:3000/tournament-registrations/42/complete \
  -H "Authorization: Bearer {token_master}" \
  -H "Content-Type: application/json" \
  -d '{
    "division_id": 5,
    "event_category_id": 2
  }'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Inscripción completada. Ahora el alumno debe subir su comprobante de pago.",
  "data": {
    "id": 42,
    "athlete_id": 10,
    "event_id": 1,
    "division_id": 5,
    "event_category_id": 2,
    "status": "pendiente",
    "payment_status": "no_pagado",
    "master_validation_date": "2026-03-16T14:30:00Z"
  }
}
```

---

### Test 3: Alumno sube comprobante

```bash
curl -X POST http://localhost:3000/tournament-registrations/42/upload-payment \
  -H "Authorization: Bearer {token_alumno}" \
  -H "Content-Type: application/json" \
  -d '{
    "payment_method": "digital",
    "payment_reference": "ref123456",
    "payment_proof_url": "https://..."
  }'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Comprobante de pago cargado. Espera la validación del administrador.",
  "data": {
    "id": 42,
    "payment_status": "en_espera",
    "payment_method": "digital",
    "payment_reference": "ref123456"
  }
}
```

---

### Test 4: Master valida pago

```bash
curl -X PATCH http://localhost:3000/tournament-registrations/42/validate-payment \
  -H "Authorization: Bearer {token_master}" \
  -H "Content-Type: application/json"
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Pago validado exitosamente.",
  "data": {
    "id": 42,
    "payment_status": "pagado",
    "status": "validado"
  }
}
```

---

## Checklist Final

- [ ] Compilé: `npm run build` (sin errores)
- [ ] Verifiqué IDs de roles (@Roles)
- [ ] Probé Test 1 (Alumno solicita) ✅
- [ ] Probé Test 2 (Master formaliza) ✅
- [ ] Probé Test 3 (Alumno paga) ✅
- [ ] Probé Test 4 (Master valida) ✅
- [ ] Los datos se guardan en BD correctamente ✅
- [ ] Git commit y push ✅
- [ ] Deployé en Render ✅

---

## Posibles Problemas y Soluciones

### Problema 1: Error "Cannot find module CompleteRegistrationDto"
**Solución**: Verificar que el archivo existe en:
```
src/tournament-registrations/dto/complete-registration.dto.ts
```

### Problema 2: Schema no reconoce event_id
**Solución**: 
```bash
# Limpiar cache de Drizzle
rm -rf node_modules/.drizzle

# Reinstalar
npm install

# Compilar
npm run build
```

### Problema 3: La BD tiene columnas viejas
**Solución**: Necesitas crear una MIGRACIÓN de Drizzle:
```bash
npm run db:generate
npm run db:migrate
```

### Problema 4: IDs de roles no son 2 y 5
**Solución**: 
- Abre PgAdmin o tu DB manager
- Ejecuta: `SELECT id, name FROM roles;`
- Encuentra los IDs reales
- Reemplaza en los decoradores `@Roles()`

---

## Documentos de Referencia

Consulta estos documentos si necesitas:

- **`FLUJO_CORRECTO_INSCRIPCIONES.md`** - Explicación completa del flujo
- **`RESPUESTA_A_TUS_PREGUNTAS.md`** - Respuestas a tus 2 preguntas principales
- **`CAMBIOS_APLICADOS.md`** - Resumen de todos los cambios
- **`PASO_A_PASO_RESUMIDO.txt`** - Resumen visual

---

## Siguiente Paso

Una vez que TODO compile y los tests pasen:

```bash
git add .
git commit -m "fix: Flujo correcto de inscripciones - alumno solicita, master formaliza"
git push origin event-registration-status
```

¡Listo! 🎉
