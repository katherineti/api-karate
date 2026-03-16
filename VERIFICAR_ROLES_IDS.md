# VERIFICAR IDS DE ROLES

## ⚠️ IMPORTANTE

Los endpoints utilizan IDs hardcodeados para validar roles. **Debes verificar que coincidan con tu base de datos**.

---

## Roles Utilizados en los Nuevos Endpoints

```typescript
// En los Decoradores @Roles()
@Roles(2)  // Master
@Roles(5)  // Alumno
```

---

## Cómo Verificar en tu BD

Ejecuta esta query en tu PostgreSQL:

```sql
SELECT id, name FROM roles;
```

**Debería mostrarte algo como:**

```
id | name
---|------
1  | Admin
2  | Master
3  | Maestro
4  | Representante
5  | Alumno
6  | Juez
```

---

## Si los IDs NO coinciden

Si tus IDs de roles son diferentes, debes actualizar manualmente en estos archivos:

### `src/tournament-registrations/tournament-registrations.controller.ts`

Busca todas las líneas con:
```typescript
@Roles(2)  // Cambiar este número
@Roles(5)  // Cambiar este número
```

**Líneas aproximadas:**
- Línea 75: `@Roles(5)` para POST request-participation
- Línea 91: `@Roles(5)` para POST upload-payment
- Línea 104: `@Roles(2)` para GET event registrations
- Línea 118: `@Roles(2)` para PATCH validate
- Línea 130: `@Roles(2)` para PATCH validate-payment
- Línea 142: `@Roles(2)` para PATCH reject
- Línea 157: `@Roles(5)` para GET my-events

---

## Alternativa: Usar Constantes

Si quieres hacerlo más limpio, actualiza `src/constants.ts`:

```typescript
// src/constants.ts
export const ROL_ADMIN = 1;
export const ROL_MASTER = 2;
export const ROL_MAESTRO = 3;
export const ROL_REPRESENTANTE = 4;
export const ROL_ALUMNO = 5;
export const ROL_JUEZ = 6;
```

Luego en el controller:

```typescript
import { ROL_MASTER, ROL_ALUMNO } from '../constants';

@Roles(ROL_ALUMNO)  // En lugar de @Roles(5)
@Roles(ROL_MASTER)  // En lugar de @Roles(2)
```

---

## Validación Final

Una vez verificado, ejecuta:

```bash
npm run build
```

Si no hay errores de compilación, ¡estás listo para probarlo! ✅
