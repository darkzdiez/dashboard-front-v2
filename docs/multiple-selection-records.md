# Selección múltiple reutilizable

Documentos relacionados:
- [Guía awesomeModal](./awesomeModal.md)
- [Guía httpRequest y dataPaginator](./httpRequest-dataPaginator.md)

Este módulo implementa un flujo estándar para habilitar selección múltiple en tablas Vue, persistiendo el estado mediante Pinia y exponiendo utilidades reutilizables.

## Arquitectura general

- **Store**: `resources/js/stores/multipleSelectionRecordsStore.js`
  - Conserva el estado por tabla (`tableId`), incluyendo modo de selección, claves seleccionadas y payload opcional asociado a cada registro.
  - Normaliza estados previos guardados en persistencia.
  - Expone acciones para habilitar/deshabilitar selección, alternar registros, reemplazar, limpiar, etc.
  - Persiste automáticamente con `persist: true` (Pinia-persist).
- **Composable**: `resources/js/composables/useMultipleSelectionRecords.js`
  - Provee una API reactiva para una tabla específica.
  - Resuelve claves/payloads, expone métodos y estados derivados.
- **Componente de botones**: `resources/js/components/MultipleSelectionRecordsButtons.vue`
  - Renderiza los controles de selección usando slots (`notSelecting`, `selecting`, `selected`).
  - Gestiona la activación/desactivación y emite eventos.

---

## API del composable

### `useMultipleSelectionRecords(tableId, options?)`

| Parámetro | Tipo | Descripción |
|---|---|---|
| `tableId` | `String` (requerido) | Identificador único de la tabla (ej: `'configurations:user'`) |
| `options.selectionKey` | `String\|Function` | Campo o función para resolver la clave única de cada registro (default: `uuid` > `id`) |
| `options.payloadResolver` | `Function` | Transforma el registro antes de almacenarlo como payload |

### Retorna

| Propiedad / Método | Tipo | Descripción |
|---|---|---|
| `isSelecting` | `Computed<Boolean>` | Si el modo selección está activo |
| `selectedKeys` | `Computed<Array>` | Claves seleccionadas |
| `selectedPayloadMap` | `Computed<Object>` | Mapa `{key: payload}` |
| `selectedPayloads` | `Computed<Array>` | Lista de payloads |
| `selectionCount` | `Computed<Number>` | Cantidad de registros seleccionados |
| `hasSelection` | `Computed<Boolean>` | Si hay al menos un registro seleccionado |
| `enableSelection()` | `Function` | Activa modo selección |
| `disableSelection()` | `Function` | Desactiva modo selección y limpia |
| `selectRecord(record)` | `Function` | Selecciona un registro |
| `selectManyRecords(records)` | `Function` | Selecciona muchos registros (sin duplicar) |
| `deselectRecord(recordOrKey)` | `Function` | Deselecciona un registro |
| `deselectManyRecords(records)` | `Function` | Deselecciona muchos |
| `toggleRecordSelection(record)` | `Function` | Alterna selección de un registro |
| `replaceSelection(records)` | `Function` | Reemplaza toda la selección |
| `clearSelection()` | `Function` | Vacía la selección sin desactivar modo |
| `isRecordSelected(recordOrKey)` | `Function → Boolean` | Verifica si un registro está seleccionado |
| `pruneSelection(validKeys)` | `Function` | Elimina claves que no estén en la lista |

---

## Props y slots del componente

### `<MultipleSelectionRecordsButtons>`

| Propiedad | Tipo | Default | Descripción |
|---|---|---|---|
| `tableId` *(requerido)* | `String` | — | ID de la tabla, compartido con el composable |
| `selectionKey` | `String\|Function` | `'uuid'` | Campo para resolver la clave de cada registro |
| `payloadResolver` | `Function` | `null` | Resolver de payload |
| `autoDisableWhenEmpty` | `Boolean` | `false` | Desactiva selección al quedar vacía |
| `fallbackSelectingLabel` | `String` | `'Salir de la selección múltiple'` | Texto fallback |
| `fallbackSelectedClearLabel` | `String` | `'Limpiar selección'` | Texto fallback |
| `fallbackNotSelectingLabel` | `String` | `'Habilitar selección de registros'` | Texto fallback |

### Slots (scoped)

| Slot | Cuándo se muestra | Scope data |
|---|---|---|
| `notSelecting` | Selección desactivada | `{ enableSelection }` |
| `selecting` | Selección activa, 0 registros marcados | `{ selectedKeys, selectedItems, selectionCount, disableSelection, clearSelection }` |
| `selected` | Selección activa + registros marcados | `{ selectedKeys, selectedItems, selectionCount, disableSelection, clearSelection }` |

### Eventos

| Evento | Payload | Descripción |
|---|---|---|
| `selecting-enabled` | `Array` (snapshot) | Selección activada |
| `selecting-disabled` | `Array` (snapshot) | Selección desactivada |
| `selection-cleared` | — | Selección limpiada manualmente |

### Expose (ref del componente)

`isSelecting`, `selectionCount`, `selectedKeys`, `selectedItems`, `hasSelected`, `enableSelection()`, `disableSelection()`, `clearSelection()`.

---

## Integración completa con dataPaginator (ejemplo real)

Basado en `resources/js/views/configurations/user/Home.vue`:

### Script setup

```js
import MultipleSelectionRecordsButtons from '@/components/MultipleSelectionRecordsButtons.vue';
import { useMultipleSelectionRecords } from '@/composables/useMultipleSelectionRecords';

const tableId = 'configurations:user';

// 1. dataPaginator
const pagination = dataPaginator({
    urlBase: new URL(window.public_path + '/api/user'),
    filtersKeys: ['name', 'email', 'group_uuid', 'organization_uuid'],
    config: {
        cachePrefix: 'user',
        deleteEnpoint: window.public_path + '/api/user/delete/${uuid}',
        restoreEnpoint: window.public_path + '/api/user/restore/${uuid}',
    },
});

// 2. Composable de selección múltiple
const {
    isSelecting,
    selectedKeys,
    selectedPayloads,
    selectionCount,
    toggleRecordSelection,
    selectManyRecords,
    deselectManyRecords,
    isRecordSelected,
} = useMultipleSelectionRecords(tableId, {
    selectionKey: 'uuid',
});

// 3. Computed helpers para "select all" / indeterminate
const visibleItems = computed(() => pagination.paginator?.data ?? []);

const allVisibleSelected = computed(() => {
    if (!isSelecting.value) return false;
    const items = visibleItems.value;
    return items.length > 0 && items.every((item) => isRecordSelected(item));
});

const isIndeterminate = computed(() => {
    if (!isSelecting.value || visibleItems.value.length === 0) return false;
    return selectionCount.value > 0 && !allVisibleSelected.value;
});

const toggleSelectAll = (checked) => {
    const items = visibleItems.value;
    checked ? selectManyRecords(items) : deselectManyRecords(items);
};

// 4. Acción masiva
const resetPasswordMultiple = (records) => {
    if (!records || records.length === 0) return;

    window.awesomeModal
        .confirm(
            'Restablecer contraseña',
            `Se restablecerá la contraseña de ${records.length} usuario(s).`
        )
        .then((result) => {
            if (result) {
                let modal = awesomeModal.loading();
                const form_data = new FormData();
                selectedKeys.value.forEach((key) => form_data.append('uuids[]', key));

                httpRequest({
                    url: window.public_path + '/api/user/reset-password-multiple',
                    method: 'POST',
                    data: form_data,
                })
                    .then(() => {
                        modal.close();
                        awesomeModal.alert('Contraseñas restablecidas correctamente');
                    })
                    .catch(() => {
                        modal.close();
                    });
            }
        });
};

pagination.syncData();
```

### Template

```vue
<template>
    <div>
        <!-- Botones de selección múltiple -->
        <MultipleSelectionRecordsButtons :table-id="tableId" selection-key="uuid">
            <template #selected="{ selectedItems, selectionCount, disableSelection, clearSelection }">
                <button class="btn btn--primary" @click="resetPasswordMultiple(selectedItems)">
                    <i class="fas fa-key"></i> Restablecer contraseña ({{ selectionCount }})
                </button>
                <button class="btn btn--gray" @click="clearSelection">Limpiar selección</button>
                <button class="btn btn--gray" @click="disableSelection">Cerrar</button>
            </template>
            <template #selecting="{ disableSelection }">
                <button class="btn btn--gray" @click="disableSelection">Cancelar selección</button>
            </template>
            <template #notSelecting="{ enableSelection }">
                <button class="btn btn--gray" @click="enableSelection">Selección múltiple</button>
            </template>
        </MultipleSelectionRecordsButtons>

        <!-- Tabla -->
        <table>
            <thead>
                <tr>
                    <!-- Checkbox "select all" -->
                    <th class="p-0 table__checkbox">
                        <input v-if="isSelecting" type="checkbox"
                            :checked="allVisibleSelected"
                            :indeterminate="isIndeterminate"
                            @change="toggleSelectAll($event.target.checked)" />
                    </th>
                    <TableTh :pagination="pagination" orderKey="name">Nombre</TableTh>
                    <TableTh :pagination="pagination" orderKey="email">Email</TableTh>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(item, key) in pagination.paginator.data" :key="key">
                    <!-- Checkbox por fila -->
                    <td class="p-0 table__checkbox">
                        <input v-if="isSelecting" type="checkbox"
                            :checked="isRecordSelected(item)"
                            @change="toggleRecordSelection(item)" />
                    </td>
                    <td>{{ item.name }}</td>
                    <td>{{ item.email }}</td>
                    <td>
                        <router-link :to="'/user/' + item.uuid + '/edit'" class="btn btn--darkgray">
                            <i class="fas fa-edit"></i>
                        </router-link>
                    </td>
                </tr>
            </tbody>
        </table>

        <Paginator :paginator="pagination.paginator" @change="pagination.syncData" />
    </div>
</template>
```

---

## Flujo paso a paso para nuevas vistas

1. **Definir un `tableId` único** (formato `modulo:entidad`, ej: `'data:orders'`).
2. **Importar** el composable y el componente de botones.
3. **Inicializar** `dataPaginator` y `useMultipleSelectionRecords` con el mismo `tableId`.
4. **Agregar computeds** para select-all e indeterminate.
5. **Montar `<MultipleSelectionRecordsButtons>`** con los 3 slots.
6. **Agregar checkboxes** en `<thead>` (select-all) y `<tbody>` (por fila).
7. **Implementar acciones masivas** usando `selectedKeys` o `selectedPayloads`.

### Puntos clave

- La selección **persiste entre páginas** del paginator gracias a `persist: true` en Pinia.
- `visibleItems` se recalcula en cada cambio de página, pero los `selectedKeys` se mantienen a través de la navegación.
- Para enviar al backend, usar `selectedKeys` (array de UUIDs) o `selectedPayloads` (array de objetos completos).
- Al desactivar la selección (`disableSelection`), se limpia la selección automáticamente.

---

## Archivos involucrados

- `resources/js/stores/multipleSelectionRecordsStore.js`
- `resources/js/composables/useMultipleSelectionRecords.js`
- `resources/js/components/MultipleSelectionRecordsButtons.vue`
- `resources/js/views/configurations/user/Home.vue` — ejemplo de integración completa.
