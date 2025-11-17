# httpRequest y dataPaginator — Guía de uso práctico y profundo

Esta guía documenta dos utilidades globales expuestas por el front-end (inicializadas por el módulo `dashboardFront`):

- `window.httpRequest`: un wrapper fino sobre `fetch` con manejo de errores estándar y acople a modales/validaciones.
- `window.dataPaginator`: un gestor de estado para tablas con filtros, ordenamiento y paginación, integrado con Vue Router y almacenamiento local.

Ambas utilidades están pensadas para usarse en componentes Vue 3 (Composition API) una vez que el plugin ha sido montado y las funciones están disponibles en `window`.

> Nota: Ejemplos y nombres asumen un backend Laravel (paginación típica) pero sirven para cualquier backend que respete el contrato indicado.

---

## httpRequest

### Propósito
Estandarizar peticiones HTTP y el manejo de errores más comunes (401, 405, 413, 422, 500), integrando:

- Limpieza/carga de errores de validación en un objeto reactivo `errors`.
- Mensajería de error por modal (vía `awesomeModal`) cuando corresponde.
- Resolución automática de la respuesta JSON cuando `response.ok`.

### Firma
```
window.httpRequest({
  url: string,
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  data?: BodyInit | null,          // p. ej., FormData, string JSON, Blob
  errors?: Record<string, any> | null,
  displayModalErrors?: boolean,    // default: true
  clearErrors?: boolean            // default: true
}): Promise<any>
```

### Comportamiento detallado
- Siempre añade el header `X-Requested-With: XMLHttpRequest`.
- No fija `Content-Type` manualmente. Esto es intencional para que el navegador establezca `multipart/form-data` cuando se usa `FormData` (ideal para formularios/archivos).
- Éxito (`2xx`): resuelve con `response.json()`.
- 401: flujo de no autorizado (normalmente implica forzar login/redirección).
- 405: método no permitido.
- 413: tamaño del contenido excedido. Lee los meta tags `<meta name="max-file-size">` y `<meta name="post-max-size">` para informar límites.
- 422: errores de validación. Si se pasó `errors`, limpia (si `clearErrors`), hidrata campos y opcionalmente muestra modal si `displayModalErrors`.
- 500: error interno del servidor.
- Cualquier error de red o parsing: rechaza la promesa.

### Contrato mínimo esperado del backend
- Respuestas de éxito: JSON.
- 422: JSON con estructura de errores por campo, p. ej.: `{ message: string, errors: { field: [msg, ...] } }`.
- 401/405/413/500: JSON con `message` o texto razonable (la utilidad intentará extraerlo).

### Ejemplos de uso

1) GET simple (consulta)
```js
httpRequest({
  url: `${window.public_path}/api/clientes`,
  method: 'GET'
}).then((data) => {
  // data = JSON de respuesta
}).catch((err) => {
  // manejo de error
});
```

2) POST con FormData (crear recurso)
```js
const fd = new FormData();
fd.append('nombre', form.nombre);
fd.append('email', form.email);

const errors = reactive({});

httpRequest({
  url: `${window.public_path}/api/clientes`,
  method: 'POST',
  data: fd,
  errors
}).then((data) => {
  // creado
}).catch(() => {
  // si 422, errors quedará poblado por campo
});
```

3) Subida de archivo y manejo de 413
```js
const fd = new FormData();
fd.append('archivo', fileInput.files[0]);

httpRequest({
  url: `${window.public_path}/api/archivos`,
  method: 'POST',
  data: fd
}).then((data) => {
  // ok
}).catch((e) => {
  // si el servidor responde 413, httpRequest mostrará un mensaje
  // basado en los meta tags max-file-size / post-max-size.
});
```

4) PUT/PATCH para actualizar
```js
const fd = new FormData();
fd.append('nombre', form.nombre);

httpRequest({
  url: `${window.public_path}/api/clientes/${id}`,
  method: 'PUT',
  data: fd
});
```

5) DELETE con confirmación externa
```js
awesomeModal.confirm('¿Eliminar?', 'Esta acción no se puede deshacer.').then(() => {
  return httpRequest({
    url: `${window.public_path}/api/clientes/${id}`,
    method: 'DELETE'
  });
});
```

6) Notas sobre JSON
- Si necesitas enviar JSON, puedes pasar `data: JSON.stringify(payload)`. El `Content-Type` quedará como `text/plain` por defecto; si tu backend requiere `application/json`, valora estas opciones:
  - Envolver el JSON en `FormData` (recomendado si es posible).
  - O bien hacer tu propia llamada `fetch` donde controles los headers.

### Patrones y bordes
- Reintentos: implementa fuera (wrapping) según necesidad.
- Timeouts: no incorporado; usa `AbortController` si necesitas.
- Limpiar errores: deja `clearErrors: false` si quieres preservar mensajes previos.
- Errores no mapeados: revisa `err` en el `catch` para logs/telemetría.

---

## dataPaginator

### Propósito
Gestionar el estado de tablas paginadas con filtros y ordenamiento, sincronizando con el querystring de la URL, cacheando filtros/página en `sessionStorage` y soportando filtros/ordenamiento permanentes desde `localStorage`.

### Firma
```ts
window.dataPaginator({
  urlBase: string,                 // endpoint base
  filtersKeys?: string[],          // lista de claves de filtros editables
  actions?: Record<string, (ctx) => void>,   // acciones auxiliares invocables
  config?: {
    layout?: any[],                // para uso de UI externa
    cachePrefix?: string | null,   // clave para cachear filtros/página
    deleteEnpoint?: string,        // '.../delete/${uuid}'
    restoreEnpoint?: string,       // '.../restore/${uuid}'
    ignoreFilters?: boolean        // si true, no aplica filtros editables
  },
  appendFormData?: Array<{ key: string, value: any } | (() => { key: string, value: any })>
});
```

### Devuelve (estado/acciones)
- `sort`: `{ column: string|null, order: 'asc'|'desc'|null }`.
- `sortBy(column: string)`: alterna orden sobre `column` y sincroniza datos.
- `trash`: `Ref<boolean>` para alternar vista de eliminados (o criterio análogo).
- `paginator`: `Reactive<any>` contenedor de la respuesta paginada. Espera un objeto con al menos `data: any[]` y campos de paginación estándar.
- `endpoint`: `{ dataUrl: string, lastUrl: string|null }`.
- `filters`: `Reactive<Record<string,string>>` filtros editables.
- `appliedFilters`: copia aplicada (útil para componer acciones).
- `appendFormData`: lista viva de pares extra que siempre se envían.
- `applyFilters({ prespreserveLastPage?: boolean })`: aplica filtros, empuja a router query y sincroniza.
- `applyAction(name: string)`: ejecuta `actions[name]({ appliedFilters })`.
- `clearFilters()`: limpia filtros y orden, resetea cache y querystring.
- `syncData(url?: string, add?: { prespreserveLastPage?: boolean })`: fuerza sincronización manual.
- `config`: eco de configuración recibida.

### Flujo y persistencia
- Inicializa `filters` y `appliedFilters` con `filtersKeys`.
- Si `config.cachePrefix`:
  - Lee filtros desde `route.query` o `sessionStorage` (`table-filters-<prefix>`), y página desde `sessionStorage` (`table-page-<prefix>`).
  - Guarda cambios de `page` en `sessionStorage`.
- Carga filtros/ordenamientos permanentes desde `localStorage`:
  - `permanent-filters-state-<prefix>` y `permanent-sort-state-<prefix>` deben contener arrays serializados via `JSON.stringify`.
- Cada sincronización hace `POST` a `endpoint.lastUrl` (o `dataUrl`), enviando:
  - Pares de `appendFormData` (siempre),
  - Filtros aplicados (si `ignoreFilters` es `false`),
  - Estado de orden y página.

> Nota: La clave exacta de orden/página en el `FormData` depende de la implementación concreta dentro del módulo. Si tu backend es Laravel, una convención útil es:
> - `page` para la página,
> - `sort[column]` y `sort[order]` para el orden,
> - Un par por cada filtro: `filters[clave]`.

### Contrato mínimo esperado del backend (respuesta)
Se recomienda un shape compatible con la paginación de Laravel:
```json
{
  "data": [ /* filas */ ],
  "current_page": 1,
  "last_page": 10,
  "per_page": 15,
  "total": 150,
  "from": 1,
  "to": 15,
  "links": [ /* opcional para UI */ ]
}
```

### Ejemplos de uso en un componente Vue 3

1) Tabla mínima con filtros y ordenamiento
```vue
<script setup>
import { ref, reactive, computed } from 'vue';

const {
  paginator,
  filters,
  appliedFilters,
  sort,
  sortBy,
  applyFilters,
  clearFilters,
  syncData
} = window.dataPaginator({
  urlBase: `${window.public_path}/api/clientes/paginar`,
  filtersKeys: ['q', 'status'],
  config: {
    cachePrefix: 'clientes',
  },
  appendFormData: [
    { key: 'include', value: 'contacts' },
  ]
});

// Carga inicial
syncData();
</script>

<template>
  <div>
    <input v-model="filters.q" placeholder="Buscar..." />
    <select v-model="filters.status">
      <option value="">Todos</option>
      <option value="active">Activos</option>
      <option value="inactive">Inactivos</option>
    </select>
    <button @click="applyFilters()">Aplicar</button>
    <button @click="clearFilters()">Limpiar</button>

    <table>
      <thead>
        <tr>
          <th @click="sortBy('nombre')">Nombre
            <small v-if="sort.column==='nombre'">({{ sort.order }})</small>
          </th>
          <th>Email</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in paginator.data" :key="row.id">
          <td>{{ row.nombre }}</td>
          <td>{{ row.email }}</td>
        </tr>
      </tbody>
    </table>

    <div class="pager">
      <button :disabled="paginator.current_page<=1" @click="syncData(`${paginator.path}?page=${paginator.current_page-1}`)">Anterior</button>
      <span>{{ paginator.current_page }} / {{ paginator.last_page }}</span>
      <button :disabled="paginator.current_page>=paginator.last_page" @click="syncData(`${paginator.path}?page=${paginator.current_page+1}`)">Siguiente</button>
    </div>
  </div>
</template>
```

2) Acciones borrar/restaurar y filtros permanentes
```js
const actions = {
  exportar({ appliedFilters }) {
    // ejemplo: exportación con filtros aplicados
    const fd = new FormData();
    Object.entries(appliedFilters).forEach(([k, v]) => fd.append(`filters[${k}]`, v ?? ''));
    httpRequest({
      url: `${window.public_path}/api/clientes/export`,
      method: 'POST',
      data: fd
    }).then(() => awesomeModal.alert('Exportación en curso'));
  }
};

const pager = window.dataPaginator({
  urlBase: `${window.public_path}/api/clientes/paginar`,
  filtersKeys: ['q'],
  actions,
  config: {
    cachePrefix: 'clientes',
    deleteEnpoint: `${window.public_path}/api/clientes/delete/${'${uuid}'}`,
    restoreEnpoint: `${window.public_path}/api/clientes/restore/${'${uuid}'}`
  },
  appendFormData: [
    () => ({ key: 'trash', value: pager.trash.value ? 1 : 0 })
  ]
});

// Guardar filtros permanentes (una sola vez):
localStorage.setItem('permanent-filters-state-clientes', JSON.stringify([
  { key: 'status', value: 'active' }
]));
localStorage.setItem('permanent-sort-state-clientes', JSON.stringify([
  { column: 'nombre', order: 'asc' }
]));
```

3) Paginación con página en cache
- Define `config.cachePrefix`. La utilidad guardará/restaurará `page` y filtros desde `sessionStorage` para ofrecer continuidad al volver a la vista.

### Buenas prácticas y bordes
- Usa `appendFormData` para enviar parámetros no editables (empresa, tenant, toggles globales, `trash`, etc.). Puedes pasar funciones para evaluar valores al vuelo.
- Si el backend espera nombres distintos para filtros/orden, adapta en el servidor o transforma en `appendFormData`.
- Si `ignoreFilters` es `true`, los filtros editables no se envían; útil cuando el endpoint decide filtros desde `appendFormData` o `permanentFilters`.
- Maneja borrado/restauración con confirmaciones y endpoints que acepten el identificador (p. ej. `uuid`).

---

## Integración con el ecosistema del proyecto
- `awesomeModal`: usado para loaders, confirmaciones y mensajes. Asegura su inicialización.
- `window.public_path`: base pública definida por meta `<meta name="public-path">`.
- Meta tags opcionales:
  - `max-file-size` y `post-max-size` para mensajes de error 413.
  - `decimal-separator` y `thousands-separator` son usados por otras utilidades (p. ej., `toCurrency`).

---

## Checklist de implementación rápida
- Inicializa el front (que expone utilidades en `window`).
- Para formularios, usa `FormData` con `httpRequest` y pasa un objeto `errors` reactivo para 422.
- Para tablas, crea un `dataPaginator` con `urlBase`, define `filtersKeys`, y llama `syncData()` al montar.
- Habilita persistencia con `cachePrefix` y, si necesitas, define filtros/orden permanente en `localStorage`.

---

## FAQ
- ¿Puedo enviar JSON con `httpRequest`? Sí, pero el `Content-Type` no se establece automáticamente como `application/json`. Prefiere `FormData` o usa `fetch` manual si necesitas controlar headers.
- ¿Cómo pagino desde el backend? Acepta `page`, filtros y orden; devuelve un objeto con `data` y metadatos de paginación. La estructura Laravel funciona directo.
- ¿Cómo sincroniza con la URL? Al aplicar filtros, empuja `query` al router. Esto permite compartir/guardar estados por URL.

---

## Ejemplo end-to-end (listar + crear)
```vue
<script setup>
import { reactive, ref, onMounted } from 'vue';

const errors = reactive({});
const form = reactive({ nombre: '', email: '' });

const pager = window.dataPaginator({
  urlBase: `${window.public_path}/api/clientes/paginar`,
  filtersKeys: ['q'],
  config: { cachePrefix: 'clientes' }
});

onMounted(() => pager.syncData());

function crear() {
  const fd = new FormData();
  fd.append('nombre', form.nombre);
  fd.append('email', form.email);

  httpRequest({
    url: `${window.public_path}/api/clientes`,
    method: 'POST',
    data: fd,
    errors
  }).then(() => {
    Object.assign(form, { nombre: '', email: '' });
    pager.syncData(); // refrescar tabla
  });
}
</script>

<template>
  <div>
    <form @submit.prevent="crear">
      <input v-model="form.nombre" placeholder="Nombre" />
      <div v-if="errors.nombre">{{ errors.nombre[0] }}</div>
      <input v-model="form.email" placeholder="Email" />
      <div v-if="errors.email">{{ errors.email[0] }}</div>
      <button type="submit">Crear</button>
    </form>

    <input v-model="pager.filters.q" placeholder="Buscar..." />
    <button @click="pager.applyFilters()">Buscar</button>

    <ul>
      <li v-for="c in pager.paginator.data" :key="c.id">{{ c.nombre }} - {{ c.email }}</li>
    </ul>
  </div>
</template>
```