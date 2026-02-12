# httpRequest y dataPaginator — Guía de uso

Documentos relacionados:
- [Guía awesomeModal](./awesomeModal.md)
- [Guía selección múltiple](./multiple-selection-records.md)

Esta guía documenta dos utilidades globales del front-end:

- `window.httpRequest`: wrapper sobre `fetch` con manejo de errores estándar y acople a modales/validaciones.
- `window.dataPaginator`: gestor de estado para tablas con filtros, ordenamiento y paginación, integrado con Vue Router y almacenamiento local.

Ambas están disponibles en `window` una vez montado el plugin `dashboardFront`.

---

## httpRequest

### Propósito
Estandarizar peticiones HTTP y el manejo de errores más comunes (401, 405, 413, 422, 500), integrando:

- Limpieza/carga de errores de validación en un objeto reactivo `errors`.
- Mensajería de error por modal (vía `awesomeModal`) cuando corresponde.
- Resolución automática de la respuesta JSON cuando `response.ok`.
- Control de versiones del cliente mediante cabeceras.

### Firma
```js
window.httpRequest({
  url: string,                     // URL completa (usar window.public_path + '/api/...')
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',  // default: 'GET'
  data?: FormData | null,          // cuerpo de la petición (generalmente FormData)
  errors?: reactive({}),           // objeto reactivo para poblar errores de validación (422)
  displayModalErrors?: boolean,    // default: true — mostrar modal en caso de error
  clearErrors?: boolean            // default: true — limpiar errores antes de la petición
}): Promise<any>
```

### Comportamiento detallado
- Siempre añade el header `X-Requested-With: XMLHttpRequest`.
- **No fija `Content-Type`** manualmente. Esto es intencional para que el navegador establezca `multipart/form-data` cuando se usa `FormData` (ideal para formularios/archivos).
- Éxito (`2xx`): resuelve con `response.json()`.
- 401: flujo de no autorizado (fuerza login/redirección).
- 405: método no permitido.
- 413: tamaño del contenido excedido. Lee los meta tags `<meta name="max-file-size">` y `<meta name="post-max-size">` para informar límites.
- 422: errores de validación. Si se pasó `errors`, limpia (si `clearErrors`), hidrata campos y opcionalmente muestra modal si `displayModalErrors`.
- 500: error interno del servidor.
- Cualquier error de red o parsing: rechaza la promesa.

### Contrato mínimo esperado del backend
- Respuestas de éxito: JSON.
- 422: JSON con estructura `{ message: string, errors: { field: [msg, ...] } }`.
- 401/405/413/500: JSON con `message` o texto razonable.

---

### Convenciones del proyecto

| Aspecto | Convención |
|---------|-----------|
| Body de envío | Siempre `FormData` (nunca JSON raw) |
| Archivos | Condicionados con `instanceof File` antes de append |
| Loading | `awesomeModal.loading()` → `.close()` en then y catch |
| Errores 422 | Objeto `errors` reactivo con arrays vacíos por campo |
| Confirmaciones | `awesomeModal.confirm()` → then → loading → httpRequest |
| URLs | Siempre prefijadas con `window.public_path` |

---

### Ejemplos de uso

#### 1) GET — Cargar datos al montar un componente

```js
let modal = awesomeModal.loading();
httpRequest({
    url: window.public_path + '/api/organization/' + route.params.id,
    method: 'GET',
})
    .then((data) => {
        form.id = data.id;
        form.name = data.name;
        form.logo_url = data.logo_url;
        modal.close();
    })
    .catch((error) => {
        modal.close();
    });
```

#### 2) GET silencioso (sin modal de errores)

```js
httpRequest({
    url: window.public_path + '/api/shipment/route/' + props.uuid,
    method: 'GET',
    displayModalErrors: false,
})
    .then((data) => {
        stops.push(...data.stops);
    })
    .catch((error) => {
        displayError.value = true;
    });
```

#### 3) GET con async/await

```js
const response = await httpRequest({
    url: url.toString(),
    method: 'GET',
});
const responseData = response?.data ?? [];
```

#### 4) GET con URL construida con searchParams

```js
const url = new URL(window.public_path + '/api/dashboard/grafico');
if (weekFrom) {
    url.searchParams.set('week_number_year_from', weekFrom);
}
const response = await httpRequest({ url: url.toString(), method: 'GET' });
```

#### 5) POST con FormData — Crear recurso con validación

```js
const form = reactive({ name: '', email: '', logo: null });
const errors = reactive({ name: [], email: [], logo: [] });

const onSubmit = () => {
    let modal = awesomeModal.loading();
    const form_data = new FormData();
    form_data.append('name', form.name);
    form_data.append('email', form.email);
    if (form.logo instanceof File) form_data.append('logo', form.logo);

    httpRequest({
        url: window.public_path + '/api/organization/store',
        method: 'POST',
        data: form_data,
        errors: errors,
    })
        .then((data) => {
            modal.close();
            router.push('/incubadas');
        })
        .catch((error) => {
            modal.close();
        });
};
```

#### 6) POST con arrays en FormData

```js
const form_data = new FormData();
form.groups_read.forEach((id, index) => {
    form_data.append('groups_read[' + index + ']', id);
});
form.params.forEach((param, index) => {
    form_data.append('params[' + index + '][id]', param.id);
    form_data.append('params[' + index + '][name]', param.name);
    form_data.append('params[' + index + '][datatype]', param.datatype);
});
```

Shorthand para arrays simples:

```js
abilities.forEach((ab) => formData.append('abilities[]', ab));
```

#### 7) DELETE con confirmación previa

```js
window.awesomeModal
    .confirm('¿Está seguro?', '¿Desea eliminar este token?')
    .then((ok) => {
        if (!ok) return;
        const modal = window.awesomeModal.loading();
        httpRequest({
            url: window.public_path + `/api/personal-access-tokens/${item.id}`,
            method: 'DELETE',
        })
            .then(() => {
                modal.close();
                window.awesomeModal.alert('Token eliminado correctamente');
                pagination.syncData();
            })
            .catch(() => { modal.close(); });
    });
```

#### 8) POST sin data (trigger de acción server-side)

```js
httpRequest({
    url: window.public_path + `/api/incubada-usuario/${user.id}/toggle-active`,
    method: 'POST',
}).then(() => fetchUsers());
```

#### 9) Múltiples peticiones en paralelo

```js
const [groupsResponse, organizationsResponse] = await Promise.all([
    httpRequest({ url: window.public_path + '/api/group/list-select', method: 'POST' }),
    httpRequest({ url: window.public_path + '/api/organization/list-select', method: 'POST' }),
]);
```

#### 10) Subida de archivos con verificación `instanceof File`

```js
const formData = new FormData();
if (form.logo instanceof File) formData.append('logo', form.logo);
if (form.equipment_consent instanceof File) formData.append('equipment_consent', form.equipment_consent);
if (form.contract instanceof File) formData.append('contract', form.contract);
```

---

### Manejo de errores de validación (422)

Cuando el backend retorna 422, `httpRequest` automáticamente:

1. Limpia los arrays del objeto `errors` (si `clearErrors: true`).
2. Hidrata cada campo con `Object.assign(errors, responseData.errors)`.
3. Si `displayModalErrors: true`, muestra un modal con la lista de errores.

**Definición del objeto errors:**

```js
const errors = reactive({
    name: [],
    email: [],
    phone: [],
    // un array vacío por cada campo validable
});
```

**Uso en template con componentes de input:**

```vue
<InputText label="Email" v-model="form.email" :error="errors.email" />
```

**Limpieza manual previa (patrón alternativo):**

```js
Object.keys(errors).forEach((key) => {
    errors[key].splice(0, errors[key].length);
});
```

---

### Patrones avanzados
- **Reintentos:** implementar fuera (wrapping) según necesidad.
- **Timeouts:** no incorporado; usar `AbortController` si es necesario.
- **JSON raw:** si se necesita enviar JSON, pasar `data: JSON.stringify(payload)`. El `Content-Type` no se establece automáticamente. Preferir `FormData`.
- **Limpiar errores:** usar `clearErrors: false` para preservar mensajes previos.

---

## dataPaginator

### Propósito
Gestionar el estado de tablas paginadas con filtros y ordenamiento, sincronizando con el querystring de la URL, cacheando filtros/página en `sessionStorage` y soportando filtros/ordenamiento permanentes desde `localStorage`.

### Firma
```js
window.dataPaginator({
  urlBase: URL | string,           // endpoint base (usar new URL(...))
  filtersKeys?: string[],          // claves de filtros editables
  actions?: Record<string, (ctx) => void>,  // acciones auxiliares invocables
  config?: {
    cachePrefix?: string | null,   // clave para cachear filtros/página
    deleteEnpoint?: string | null, // '.../delete/${uuid}'
    restoreEnpoint?: string | null,// '.../restore/${uuid}'
    ignoreFilters?: boolean,       // si true, no aplica filtros editables
  },
  appendFormData?: Array<{ key: string, value: any } | (() => { key: string, value: any })>
});
```

### Devuelve (estado/acciones)

| Propiedad / Método | Tipo | Descripción |
|---|---|---|
| `paginator` | `Reactive<Object>` | Respuesta paginada del backend. Contiene `data: any[]` y campos de paginación. |
| `filters` | `Reactive<Record>` | Filtros editables (vinculados a inputs). |
| `appliedFilters` | `Object` | Copia de filtros aplicados (útil para acciones). |
| `sort` | `{ column, order }` | Estado actual de ordenamiento. |
| `trash` | `Ref<boolean>` | Alterna vista de eliminados/activos. |
| `endpoint` | `{ dataUrl, lastUrl }` | URLs del endpoint. |
| `appendFormData` | `Array` | Pares extra que siempre se envían. |
| `config` | `Object` | Eco de configuración recibida. |
| `sortBy(column)` | `Function` | Alterna orden sobre la columna y sincroniza. |
| `applyFilters(opts?)` | `Function` | Aplica filtros, empuja query al router y sincroniza. |
| `applyAction(name)` | `Function` | Ejecuta una acción definida en `actions`. |
| `clearFilters()` | `Function` | Limpia filtros, orden, cache y querystring. |
| `syncData(url?, opts?)` | `Function` | Fuerza sincronización manual. |

### Flujo y persistencia
- Si `config.cachePrefix`:
  - Lee filtros desde `route.query` o `sessionStorage` (`table-filters-<prefix>`).
  - Guarda página en `sessionStorage` (`table-page-<prefix>`).
- Filtros/ordenamientos permanentes desde `localStorage`:
  - `permanent-filters-state-<prefix>` y `permanent-sort-state-<prefix>`.
- Cada sincronización hace `POST` al endpoint enviando filtros, orden, página y `appendFormData`.

### Contrato mínimo del backend (respuesta)
Shape compatible con la paginación de Laravel:
```json
{
  "data": [],
  "current_page": 1,
  "last_page": 10,
  "per_page": 15,
  "total": 150,
  "from": 1,
  "to": 15,
  "links": []
}
```

---

### Ejemplos de uso (patrones reales del proyecto)

#### 1) Inicialización típica

```js
const pagination = dataPaginator({
    urlBase: new URL(window.public_path + '/api/translations'),
    filtersKeys: ['key'],
    config: {
        cachePrefix: 'translations',
        deleteEnpoint: window.public_path + '/api/translations/delete/${uuid}',
        restoreEnpoint: window.public_path + '/api/translations/restore/${uuid}',
    },
});
pagination.syncData();
```

#### 2) Sin endpoints de delete/restore

```js
const pagination = dataPaginator({
    urlBase: new URL(window.public_path + '/api/cotizacion/solicitudes-disponibles'),
    filtersKeys: ['po', 'fecha_arribo', 'response_status'],
    config: {
        cachePrefix: 'solicitudes-disponibles',
        deleteEnpoint: null,
        restoreEnpoint: null,
    },
});
```

#### 3) Con `ignoreFilters`

```js
const pagination = dataPaginator({
    urlBase: new URL(window.public_path + '/api/lab-equipment'),
    filtersKeys: ['name', 'description'],
    config: {
        cachePrefix: 'lab-equipment',
        deleteEnpoint: window.public_path + '/api/lab-equipment/delete/${uuid}',
        restoreEnpoint: window.public_path + '/api/lab-equipment/restore/${uuid}',
        ignoreFilters: route.query.ignoreFilters,
    },
});
```

#### 4) Filtros en template

```vue
<!-- Input de texto con enter para buscar -->
<input type="text" v-model="pagination.filters.incubator"
       @keyup.enter="pagination.applyFilters" />

<!-- Select con cambio automático -->
<select v-model="pagination.filters.group_uuid" @change="pagination.applyFilters()">
    <option value="">Todos</option>
    <option v-for="group in groupOptions" :key="group.uuid" :value="group.uuid">
        {{ group.name }}
    </option>
</select>

<!-- Input de fecha -->
<input type="date" v-model="pagination.filters.expiration_date"
       @change="pagination.applyFilters" />

<!-- Botones buscar / limpiar -->
<button class="btn btn--blue" @click="pagination.applyFilters">
    <i class="fas fa-search"></i>
</button>
<button class="btn btn--gray" @click="pagination.clearFilters">
    <i class="fas fa-eraser"></i>
</button>
```

#### 5) Inicialización manual de filtros select

Si se usan `<select>` que requieren un valor vacío inicial:

```js
if (pagination.filters.group_uuid == null) {
    pagination.filters.group_uuid = '';
}
if (pagination.filters.organization_uuid == null) {
    pagination.filters.organization_uuid = '';
}
```

#### 6) Ordenamiento con `<TableTh>`

El componente `<TableTh>` llama internamente a `pagination.sortBy(orderKey)`:

```vue
<TableTh :pagination="pagination" orderKey="expiration_date">Fecha</TableTh>
<TableTh :pagination="pagination" orderKey="user_id">Responsable</TableTh>
<TableTh :pagination="pagination" orderKey="detail">Detalle</TableTh>
```

#### 7) Trash toggle (papelera)

`pagination.trash` es un `Ref<boolean>`. Al cambiarlo, dataPaginator re-sincroniza automáticamente:

```vue
<button class="btn btn--darkgray-outline"
        @click="pagination.trash.value = true"
        v-if="!pagination.trash.value">
    <i class="fas fa-trash-alt"></i> Papelera
</button>
<button class="btn btn--darkgray-outline"
        @click="pagination.trash.value = false"
        v-if="pagination.trash.value">
    <i class="fas fa-undo"></i> Salir de la Papelera
</button>
```

#### 8) Delete/Restore inyectados por dataPaginator

Los items de `pagination.paginator.data` reciben métodos `deleteItem` y `restoreItem` automáticamente (si se configuraron los endpoints):

```vue
<!-- Botón eliminar (fuera de papelera) -->
<button class="btn btn--red" @click="item.deleteItem" v-if="!pagination.trash.value">
    <i class="fas fa-trash-alt"></i>
</button>

<!-- Botón restaurar (dentro de papelera) -->
<button class="btn btn--green" @click="item.restoreItem" v-if="pagination.trash.value">
    <i class="fas fa-undo"></i>
</button>
```

#### 9) Renderizado de tabla con `v-for` y Paginator

```vue
<table>
    <thead>
        <tr>
            <TableTh :pagination="pagination" orderKey="name">Nombre</TableTh>
            <TableTh :pagination="pagination" orderKey="email">Email</TableTh>
            <th>Acciones</th>
        </tr>
    </thead>
    <tbody>
        <tr v-for="(item, key) in pagination.paginator.data" :key="key">
            <td>{{ item.name }}</td>
            <td>{{ item.email }}</td>
            <td>
                <router-link :to="'/user/' + item.uuid + '/edit'" class="btn btn--darkgray">
                    <i class="fas fa-edit"></i>
                </router-link>
                <button class="btn btn--gray" @click="item.deleteItem">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    </tbody>
</table>

<Paginator :paginator="pagination.paginator" @change="pagination.syncData" />
```

#### 10) `syncData` para refrescar después de una acción

```js
// Carga inicial
pagination.syncData();

// Refrescar después de httpRequest
httpRequest({ url, method: 'POST', data: form_data })
    .then(() => pagination.syncData());

// Desde un modal que modifica datos
httpRequest({ ... })
    .then((data) => {
        props.data.rawData.pagination.syncData();  // referencia al paginator padre
        modal.close();
        props.data.callback.resolve(data);
    });
```

#### 11) Con `TableBaseLayout` y columns dinámicas

```js
const columns = [
    { name: 'nombre', label: 'Nombre', searchable: true },
    { name: 'estado', label: 'Estado', searchable: true },
];

const pagination = dataPaginator({
    urlBase: new URL(window.public_path + '/api/control-logistica'),
    filtersKeys: columns.filter((c) => c.searchable).map((c) => c.name),
    config: { cachePrefix: 'control-logistica' },
});
```

```vue
<TableBaseLayout :pagination="pagination" :columns="columns" :clearFilters="clearFilters">
    <template #itemButtons="{ item }">
        <td class="col-end-sticky td-link p-0">
            <router-link :to="'/control-logistica/' + item.numero_contenedor + '/show'">
                <i class="fas fa-chevron-right"></i>
            </router-link>
        </td>
    </template>
</TableBaseLayout>
```

---

### Buenas prácticas

- Usar `new URL(window.public_path + '/api/...')` para `urlBase`.
- Siempre definir `cachePrefix` para persistencia de filtros/página.
- Usar `appendFormData` para parámetros no editables (empresa, tenant, `trash`). Se pueden pasar funciones para evaluar al vuelo.
- Si `ignoreFilters` es `true`, los filtros editables no se envían; útil cuando los filtros vienen de `appendFormData` o permanentes.
- Para borrado/restauración, configurar `deleteEnpoint` y `restoreEnpoint` con el placeholder `${uuid}`.

---

## Integración con el ecosistema

- `awesomeModal`: usado para loaders, confirmaciones y mensajes.
- `window.public_path`: base pública definida por meta `<meta name="public-path">`.
- Meta tags opcionales: `max-file-size` y `post-max-size` para mensajes de error 413.

---

## Checklist de implementación rápida

1. Para formularios: usar `FormData` con `httpRequest` y pasar un objeto `errors` reactivo para 422.
2. Para tablas: crear un `dataPaginator` con `urlBase`, definir `filtersKeys`, y llamar `syncData()` al montar.
3. Habilitar persistencia con `cachePrefix`.
4. Agregar `<Paginator>` y `<TableTh>` en el template.
5. Configurar `deleteEnpoint`/`restoreEnpoint` si la tabla tiene papelera.

---

## Ejemplo end-to-end (listar + crear)

```vue
<script setup>
import { reactive, onMounted } from 'vue';

const errors = reactive({ nombre: [], email: [] });
const form = reactive({ nombre: '', email: '' });

const pagination = dataPaginator({
    urlBase: new URL(window.public_path + '/api/clientes/paginar'),
    filtersKeys: ['q'],
    config: { cachePrefix: 'clientes' },
});

onMounted(() => pagination.syncData());

function crear() {
    const fd = new FormData();
    fd.append('nombre', form.nombre);
    fd.append('email', form.email);

    let modal = awesomeModal.loading();
    httpRequest({
        url: window.public_path + '/api/clientes',
        method: 'POST',
        data: fd,
        errors,
    })
        .then(() => {
            modal.close();
            Object.assign(form, { nombre: '', email: '' });
            pagination.syncData();
        })
        .catch(() => {
            modal.close();
        });
}
</script>

<template>
    <div>
        <form @submit.prevent="crear">
            <InputText label="Nombre" v-model="form.nombre" :error="errors.nombre" />
            <InputText label="Email" v-model="form.email" :error="errors.email" />
            <button type="submit" class="btn btn--darkgray">Crear</button>
        </form>

        <input v-model="pagination.filters.q" placeholder="Buscar..."
               @keyup.enter="pagination.applyFilters" />
        <button @click="pagination.applyFilters()" class="btn btn--blue">
            <i class="fas fa-search"></i>
        </button>

        <table>
            <tbody>
                <tr v-for="c in pagination.paginator.data" :key="c.id">
                    <td>{{ c.nombre }}</td>
                    <td>{{ c.email }}</td>
                </tr>
            </tbody>
        </table>

        <Paginator :paginator="pagination.paginator" @change="pagination.syncData" />
    </div>
</template>
```

---

## FAQ

- **¿Puedo enviar JSON con `httpRequest`?** Sí, pero el `Content-Type` no se establece automáticamente como `application/json`. Preferí `FormData` o usá `fetch` manual.
- **¿Cómo pagino desde el backend?** Aceptá `page`, filtros y orden; devolvé un objeto con `data` y metadatos de paginación. La estructura Laravel funciona directo.
- **¿Cómo sincroniza con la URL?** Al aplicar filtros, empuja `query` al router. Esto permite compartir/guardar estados por URL.
- **¿Cómo paso archivos?** Usá `FormData.append('field', fileInput)`. Verificá con `instanceof File` antes de appendear.
