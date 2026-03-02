# Impersonación con link temporal

## Objetivo
Agregar una variante de `login-as` para que un usuario con permiso pueda:

1. Ingresar inmediatamente como otro usuario (flujo existente).
2. Generar un link temporal reutilizable hasta su vencimiento para abrir sesión en otra ventana/navegador/incógnito.

## Componentes involucrados

- Frontend: `packages/dashboard-front-v2/views/configurations/user/Home.vue`
- Modal UI: `packages/dashboard-front-v2/views/configurations/user/ModalLoginAsOptions.vue`
- Backend controller: `packages/dashboard-back-v2/src/Controllers/UserController.php`
- Rutas: `packages/dashboard-back-v2/src/routes/api.php`
- Persistencia: `packages/dashboard-back-v2/src/migrations/2026_03_02_000001_create_user_login_as_links_table.php`

## Rutas nuevas

### Generar link temporal (autenticada)
- `POST /api/user/login-as-link/generate`
- Requiere permiso `login-as`.
- Body (`FormData`):
  - `target_id` (uuid del usuario objetivo)
  - `expiration_minutes` (solo: `1`, `2`, `3`, `5`, `10`)
- Respuesta:
  - `message`
  - `link`
  - `expires_at`
  - `expiration_minutes`

### Consumir link temporal (pública)
- `GET /api/user/login-as-link/{token}`
- Si el token es válido y no venció:
  - Inicia sesión como el usuario objetivo.
  - Redirige a `url('/')`.
- Si es inválido/vencido:
  - Responde HTML simple con mensaje de error.

## Comportamiento funcional

- El link **no se invalida al primer uso**.
- Puede usarse varias veces hasta `expires_at`.
- Se guarda contador de usos (`usage_count`) y último uso (`last_used_at`).

## Auditoría

Se registran eventos en actividad:

- `impersonate-link-created`: cuando se genera el enlace.
- `impersonate-link-used`: cada vez que se consume el enlace.

Además, se mantiene el flujo existente:

- `impersonate-start` para login-as directo.
- `impersonate-end` para volver al usuario original.

## Tabla de persistencia

`user_login_as_links`:

- `token_hash` (sha256 del token en texto plano)
- `actor_user_id`
- `target_user_id`
- `expiration_minutes`
- `expires_at`
- `usage_count`
- `last_used_at`
- `revoked_at`
- `timestamps`

## Notas de seguridad

- Nunca se guarda el token plano en DB, solo hash.
- El permiso requerido para generar enlaces es el mismo que para `login-as` directo.
- El endpoint público valida expiración y revocación antes de autenticar.
