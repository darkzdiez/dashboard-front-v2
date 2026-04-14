# Impersonación con link temporal

Documentos relacionados:
- [Dashboard Front V2 README](../README.md)
- [Guía httpRequest y dataPaginator](./httpRequest-dataPaginator.md)

## Objetivo
Agregar una variante de `login-as` para que un usuario con permiso pueda:

1. Ingresar inmediatamente como otro usuario (flujo existente).
2. Generar un link temporal reutilizable hasta su vencimiento para abrir sesión en otra ventana/navegador/incógnito.

## Contexto del cambio

La primera versión del flujo obligaba a que cada proyecto consumidor definiera manualmente la ruta `/login-as-link` y su vista de recepción del token. Eso generaba dos problemas:

1. La ruta pública podía faltar en el router del proyecto aunque el backend ya generara el link.
2. El bootstrap legacy de autenticación de `dashboard-front-v2` podía redirigir a `/login` antes de dejar consumir el enlace.

Para evitar esa repetición, el flujo quedó centralizado en el paquete frontend:

- `dashboardFront(...)` registra la ruta pública `/login-as-link` automáticamente.
- `window.verifyAuth()` reconoce esa ruta como pública y no la redirige a `/login`.
- La vista compartida `views/login/LoginAsLink.vue` resuelve el token temporal sin que cada proyecto tenga que duplicar la pantalla.

## Componentes involucrados

- Frontend: `packages/dashboard-front-v2/views/configurations/user/Home.vue`
- Modal UI: `packages/dashboard-front-v2/views/configurations/user/ModalLoginAsOptions.vue`
- Route bootstrap: `packages/dashboard-front-v2/index.js`
- Shared public view: `packages/dashboard-front-v2/views/login/LoginAsLink.vue`
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
- Ruta frontend compartida: `/login-as-link?token=...`
- Vista compartida: `packages/dashboard-front-v2/views/login/LoginAsLink.vue`
- La vista resuelve dos variantes:
  - Frontend tokenizado: hace `POST /api/user/login-as-link/exchange`, delega la hidratación de sesión a `window.$globalState.applyImpersonationSession(response)` y luego redirige a `response.data.user.default_home`.
  - App web legacy con sesión: si frontend y backend comparten origen, redirige a `GET /api/user/login-as-link/{token}` para que el backend haga `auth()->login(...)` y cree la sesión web.

## Comportamiento funcional

- El link **no se invalida al primer uso**.
- Puede usarse varias veces hasta `expires_at`.
- Se guarda contador de usos (`usage_count`) y último uso (`last_used_at`).
- La ruta pública `/login-as-link` ya no debe definirse manualmente en cada consumer salvo que se quiera overridear el comportamiento compartido.

## Flujo end-to-end

1. `ModalLoginAsOptions.vue` genera el link mediante `POST /api/user/login-as-link/generate`.
2. `dashboard-back-v2` arma la URL absoluta del link usando `config('app.frontend_url')`, o `Origin`/`app.url` como fallback.
3. El usuario abre `/login-as-link?token=...`.
4. `dashboard-front-v2/index.js` deja pasar esa ruta aunque no exista sesión, porque la registra como pública.
5. `LoginAsLink.vue` detecta si el consumer expone `window.$globalState.applyImpersonationSession`:
   - Si existe, consume el tokenizado por `exchange`.
   - Si no existe y la app es same-origin, deriva al endpoint backend que crea la sesión web.
6. Después del login, el usuario termina en `default_home` o en `/` según el payload devuelto.

## Responsabilidades del proyecto consumidor

- Seguir pasando `router` al llamar `dashboardFront(...)`.
- Si el proyecto es un frontend desacoplado con auth por token, implementar `window.$globalState.applyImpersonationSession(response)`.
- Configurar `frontend_url` en backend cuando frontend y backend no comparten la misma base URL.
- No volver a duplicar `/login-as-link` en el router salvo que el proyecto necesite una implementación distinta.

## Cambios realizados en esta centralización

- Se agregó una whitelist pública central en `packages/dashboard-front-v2/index.js`.
- Se inyectó la ruta `/login-as-link` con `router.addRoute(...)` dentro del paquete.
- Se movió la vista de recepción del token al paquete frontend.
- Se dejó fallback explícito para apps legacy con sesión web.

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
- El frontend compartido no persiste tokens por su cuenta: delega la hidratación al consumer cuando existe un store tokenizado.
