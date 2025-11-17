# Selección múltiple reutilizable

Este módulo implementa un flujo estándar para habilitar selección múltiple en tablas Vue, persistiendo el estado mediante Pinia y exponiendo un conjunto de utilidades reutilizables.

## Arquitectura general

- **Store**: `resources/js/stores/multipleSelectionRecordsStore.js`
  - Conserva el estado por tabla (`tableId`), incluyendo modo de selección, claves seleccionadas y payload opcional asociado a cada registro.
  - Normaliza estados previos guardados en persistencia.
  - Expone acciones para habilitar/deshabilitar selección, alternar registros, reemplazar, limpiar, etc.
- **Composable**: `resources/js/composables/useMultipleSelectionRecords.js`
  - Provee una API reactiva para una tabla específica.
  - Resuelve claves/payloads, expone métodos (`selectManyRecords`, `toggleRecordSelection`, `clearSelection`, etc.) y estados derivados (`isSelecting`, `selectionCount`, `selectedItems`).
- **Componente de botones**: `resources/js/components/MultipleSelectionRecordsButtons.vue`
  - Renderiza los controles de selección usando slots (`notSelecting`, `selecting`, `selected`).
  - Gestiona la activación/desactivación y emite eventos para integraciones personalizadas.
- **Vistas de ejemplo**:
  - `resources/js/views/configurations/pais/Home.vue`
  - `resources/js/dashboard-front-v2/views/configurations/user/Home.vue`
  - Muestran integración completa con la tabla, checkbox por fila y acciones masivas.

## Flujo básico

1. **Inicializar el store**: se realiza de forma automática al usar el composable con un `tableId`. El estado se persiste (requiere configuración de Pinia-persist).
2. **Usar el composable** en la vista para obtener helpers y estados:
   ```js
   const selection = useMultipleSelectionRecords('configurations:pais', {
       selectionKey: 'uuid',
   });
   const {
       isSelecting,
       selectionCount,
       selectedItems,
       toggleRecordSelection,
       selectManyRecords,
       deselectManyRecords,
       enableSelection,
       disableSelection,
   } = selection;
   ```
3. **Renderizar checkboxes** en cabecera y filas utilizando los métodos del composable para mantener el estado sincronizado.
4. **Incluir el componente de botones** para manejar la UI principal de la selección:
   ```vue
   <MultipleSelectionRecordsButtons :table-id="tableId" selection-key="uuid">
       <template #selected="{ selectedItems, selectionCount, clearSelection, disableSelection }">
           <button @click="doBulkAction(selectedItems)">
               Acción masiva ({{ selectionCount }})
           </button>
           <button @click="clearSelection">Limpiar</button>
           <button @click="disableSelection">Cerrar</button>
       </template>
       <template #selecting="{ disableSelection }">
           <button @click="disableSelection">Cancelar selección</button>
       </template>
       <template #notSelecting="{ enableSelection }">
           <button @click="enableSelection">Habilitar selección</button>
       </template>
   </MultipleSelectionRecordsButtons>
   ```
5. **Sincronizar la tabla** usando `toggleRecordSelection`, `selectManyRecords` y `deselectManyRecords` cuando se interactúe con los checkboxes o el “select all”.

## Props y slots del componente

| Propiedad                     | Tipo                | Descripción                                                                 |
|-------------------------------|---------------------|-----------------------------------------------------------------------------|
| `tableId` *(requerido)*       | `String`            | Identificador único de la tabla, compartido con el composable/store.        |
| `selectionKey`                | `String|Function`   | Campo o función para resolver la clave de cada registro (por defecto `uuid`). |
| `payloadResolver`             | `Function`          | Permite personalizar el payload almacenado por registro (por defecto el registro completo). |
| `autoDisableWhenEmpty`        | `Boolean`           | Si es `true`, desactiva automáticamente la selección al quedar sin registros marcados. |
| `fallbackSelectingLabel`      | `String`            | Texto por defecto para el botón “Salir de la selección múltiple”.            |
| `fallbackSelectedClearLabel`  | `String`            | Texto por defecto para el botón “Limpiar selección”.                         |
| `fallbackNotSelectingLabel`   | `String`            | Texto por defecto para el botón que habilita la selección.                   |

### Slots disponibles

- `notSelecting` — Renderiza controles cuando la selección está deshabilitada. Recibe `{ enableSelection }`.
- `selecting` — Se muestra al habilitar la selección pero aún sin registros marcados. Recibe `{ disableSelection }`.
- `selected` — Visible cuando hay registros seleccionados. Recibe `{ selectedItems, selectedKeys, selectionCount, clearSelection, disableSelection }`.

## Eventos que emite el componente

- `selecting-enabled` *(payload: `Array`)* — Selección habilitada.
- `selecting-disabled` *(payload: `Array`)* — Selección deshabilitada (snap de registros).
- `selection-cleared` — Selección limpia manualmente.

## Integración en otras vistas

1. Definir un `tableId` único (p. ej. `data:orders`).
2. Importar el composable y el componente de botones en la vista.
3. Añadir checkboxes vinculados a los métodos del composable.
4. Implementar acciones masivas en el slot `selected` del componente de botones.
5. Opcional: utilizar `selectedItems` para invocar endpoints en lote, mostrar confirmaciones, etc.

## Archivos involucrados

- `resources/js/stores/multipleSelectionRecordsStore.js`
- `resources/js/composables/useMultipleSelectionRecords.js`
- `resources/js/components/MultipleSelectionRecordsButtons.vue`
- `resources/js/views/configurations/pais/Home.vue`
- `resources/js/dashboard-front-v2/views/configurations/user/Home.vue`

Estos elementos pueden tomarse como referencia para integrar la selección múltiple en cualquier otra tabla del proyecto.
