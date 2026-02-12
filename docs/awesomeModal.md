# Guía de uso de `awesomeModal`

Documentos relacionados:
- [Guía httpRequest y dataPaginator](./httpRequest-dataPaginator.md)
- [Guía selección múltiple](./multiple-selection-records.md)

AwesomeModal es el sistema global de gestión de diálogos modales. Se accede mediante `window.awesomeModal` y cubre: confirmaciones (`confirm`, `confirm2`), avisos (`alert`), notificaciones (`loading`, `success`, `error`) y modales custom con componentes Vue (`open`).

Fuente: `resources/js/dashboard-front-v2/components/Modal/index.vue`.

---

## API rápida

| Método | Retorna | Cierre | Uso típico |
|--------|---------|--------|------------|
| `open({type:'component', component, ...})` | objeto `callback` | `resolve()` / `reject()` | Modales custom con componente Vue |
| `loading(msg?)` | objeto `callback` | `.close()` | Spinner durante peticiones HTTP |
| `success(title, msg)` | objeto `callback` | click overlay / escape | Notificación de éxito |
| `error(title, msg)` | objeto `callback` | click overlay / escape | Notificación de error |
| `confirm(title, msg, buttons?)` | `Promise` | botón click → resolve(value) | Confirmación sí/no (estilo rojo/verde) |
| `confirm2(title, msg, buttons?)` | `Promise` | botón click → resolve(value) | Confirmación sí/no (estilo gris) |
| `alert(title, msg?, buttons?)` | `Promise` | botón "Aceptar" → resolve(true) | Mensaje informativo |
| `closeAll()` | void | — | Cierra todos los modales abiertos |

> **⚠️ Importante**: No utilices la propiedad `type` para pasar datos personalizados al modal, ya que es una palabra reservada para la configuración interna. Si necesitas pasar un tipo, usa un nombre alternativo como `docType`, `itemType`, etc.

Notas de cierre y prevención:
- Si `preventClose` es `true`, NO se cierra por overlay ni por la tecla Escape.
- Si `preventClose` es `false` (por defecto), overlay y Escape llaman `reject()`.
- Al cambiar de ruta, se ejecuta `closeAll()` (ver guard en `index.vue`).

---

## loading: spinner de carga

`loading` muestra un spinner y retorna un objeto `callback`. Se cierra con `.close()`. Es el compañero habitual de `httpRequest`.

```js
// Patrón estándar (usado en la mayoría de vistas del proyecto)
let modal = awesomeModal.loading();
httpRequest({ url: window.public_path + '/api/mi-endpoint', method: 'GET' })
    .then((data) => {
        modal.close();
        // usar data
    })
    .catch((error) => {
        modal.close();
    });

// Con mensaje personalizado
const g = awesomeModal.loading('Borrando historial');
// ...
g.close();
```

---

## success y error: notificaciones

Muestran un ícono (verde/check o rojo/warning) con título y mensaje. Retornan un objeto `callback` con `.promise`.

```js
// Éxito
awesomeModal.success('Guardado', 'Los cambios fueron guardados correctamente.');

// Error
awesomeModal.error('Error al guardar', 'No se pudo conectar con el servidor.');

// Encadenar acción después del cierre
awesomeModal.success('Completado', 'Operación exitosa').promise.finally(() => {
    pagination.applyFilters({ prespreserveLastPage: true });
});
```

---

## confirm: confirmación estándar

`confirm` muestra un diálogo de confirmación con botones rojo/verde. Resuelve a `true` (Aceptar) o `false` (Cancelar).

```js
// Patrón típico del proyecto: confirmar → loading → httpRequest
window.awesomeModal
    .confirm('¿Está seguro?', '¿Está seguro que desea realizar esta acción?')
    .then((result) => {
        if (result) {
            let modal = awesomeModal.loading();
            httpRequest({
                url: window.public_path + '/api/mi-endpoint',
                method: 'POST',
                data: formData,
            })
                .then((data) => {
                    modal.close();
                    awesomeModal.alert('Operación realizada correctamente');
                })
                .catch((error) => {
                    modal.close();
                });
        }
    });
```

Variante con `closeAll`:

```js
window.awesomeModal
    .confirm('¿Está seguro?', '¿Está seguro que desea realizar la sincronización?')
    .then((result) => {
        if (result) {
            window.awesomeModal.loading();
            httpRequest({ url: '...', method: 'POST' })
                .then(() => {
                    window.awesomeModal.closeAll();
                    window.awesomeModal.alert('Tarea creada correctamente');
                })
                .catch(() => {
                    window.awesomeModal.closeAll();
                });
        }
    });
```

---

## confirm2: confirmación estilizada (gris)

`confirm2` es similar a `confirm` pero usa botones con estilo gris (`darkgray-outline`/`darkgray`), sin ícono y con texto alineado a la izquierda.

```js
window.awesomeModal
  .confirm2(
    'Confirmar cancelación',
    '¿Estás seguro de cancelar esta operación?',
    [
      { content: '<i class="fas fa-times"></i> Cancelar', class: 'btn btn--darkgray-outline', value: false },
      { content: '<i class="fas fa-check"></i> Aceptar', class: 'btn btn--darkgray', value: true },
    ],
  )
  .then((result) => {
    if (result) {
      // Usuario confirmó
    }
  });
```

Personalización: cambia `buttons` para variar `content` (HTML), `class` y `value` (lo que se resuelve).

---

## alert: avisos simples

`alert` muestra un mensaje con un botón "Aceptar" por defecto y resuelve al cerrar. Acepta uno o dos argumentos.

```js
// Solo título
window.awesomeModal.alert('Datos guardados correctamente');

// Título + mensaje
window.awesomeModal.alert('Token creado', 'Copia y guarda este token ahora.');

// Con acción posterior
window.awesomeModal
    .alert('Reserva cancelada', 'La reserva ha sido cancelada correctamente.')
    .then(() => {
        router.push('/reservas');
    });
```

Puedes pasar un arreglo de `buttons` si requieres más de uno.

---

## open: modales personalizados con componentes Vue

`open` es el núcleo para modales custom. Flujo general:

1) Llamas a `open` con:
   - `type: 'component'`
   - `component: TuComponente`
   - `preventClose` (opcional)
   - cualquier otro dato que necesites pasar (p.ej.: `documento`, `item`).

2) `open` devuelve un objeto con:
   - `promise`: Promise que se resuelve/rechaza al cerrar.
   - `resolve(value)`: cierra y entrega `value` a quien abrió el modal.
   - `reject(reason)`: cierra informando un motivo.
   - `close()`: alias de `resolve`.

3) El contenedor inyecta en tu componente una prop obligatoria `data` con:
   - `rawData`: exactamente el objeto de `options` que pasaste a `open`.
   - `callback`: `{ resolve, reject, close }`.

### Patrones de apertura (ejemplos reales del proyecto)

**Patrón A — Abrir modal, capturar resultado vía promise:**

```js
import ModalNewToken from './ModalNewToken.vue';

const { promise } = window.awesomeModal.open({
    type: 'component',
    component: ModalNewToken,
    preventClose: true,
    title: 'Nuevo token',
});

promise.then(async (payload) => {
    // payload = lo que el componente devuelve vía callback.resolve(...)
    const loading = window.awesomeModal.loading();
    // ... httpRequest con payload ...
    loading.close();
});
```

**Patrón B — Pasar datos extra como props (accesibles en `data.rawData`):**

```js
import RenameModal from './RenameModal.vue';

let modal = awesomeModal.open({
    type: 'component',
    component: RenameModal,
    item: item,           // → data.rawData.item
    typeFile: typeFile,    // → data.rawData.typeFile
});
modal.promise.then((result) => {
    if (result === 'renamed') {
        fetchData();
    }
});
```

**Patrón C — Modal simple de visualización (sin result):**

```js
import ModalPreview from './ModalPreview.vue';

awesomeModal.open({
    type: 'component',
    component: ModalPreview,
    url: url,  // → data.rawData.url
});
```

**Patrón D — Pasar `preventClose: false` para modales informativos:**

```js
awesomeModal.open({
    type: 'component',
    component: ModalContenedorHistory,
    preventClose: false,
    numero_contenedor: props.numeroContenedor,  // → data.rawData.numero_contenedor
});
```

### Estructura del componente custom

Tu componente debe:
- Declarar la prop `data` como requerida.
- Leer los datos de entrada desde `data.rawData`.
- Cerrar usando `data.callback.resolve(value)` o `data.callback.reject(reason)`.

**Template (acceso a `data.rawData`):**

```vue
<!-- Ejemplo: RenameModal.vue -->
<template>
    <div class="modal container">
        <div class="modal__header">
            <h1 class="controls__title">
                Renombrar {{ data.rawData.typeFile === 'folder' ? 'Carpeta' : 'Archivo' }}
            </h1>
            <div class="modal__close" @click="close"><i class="fas fa-times"></i></div>
        </div>
        <div class="modal__body">
            <input v-model="form.name" type="text" class="form-control" />
        </div>
    </div>
</template>
```

**Script (manejo de callback):**

```vue
<script setup>
import { reactive } from 'vue';

const props = defineProps({
    data: { type: Object, required: true },
});

const form = reactive({
    name: props.data.rawData.item.name,
});

const close = () => {
    props.data.callback.reject('Cerrado por el usuario');
};

const submit = () => {
    // httpRequest, etc...
    props.data.callback.resolve('renamed');
};
</script>
```

**Ejemplo real — ModalNewToken.vue (resolve con objeto):**

```js
const onCancel = () => {
    props.data.callback.reject('cancel');
};

const onAccept = () => {
    props.data.callback.resolve({
        name: form.name,
        user_id: form.user_id,
        abilities: form.abilities,
    });
};
```

**Ejemplo real — ModalCancelarReserva.vue (resolve con string de estado):**

```js
const close = () => {
    props.data.callback.resolve('close');
};

const submit = () => {
    // httpRequest para cancelar la reserva...
    props.data.callback.resolve('submit');
};
```

---

## Ejemplo completo de ida y vuelta

Apertura y manejo de resultados:

```js
const { promise } = window.awesomeModal.open({
    type: 'component',
    component: MiModalCustom,
    preventClose: true,
    documento,
    item,
});

promise
    .then((resultado) => {
        // Éxito: usar resultado
    })
    .catch((reason) => {
        // Cancelación o cierre: manejar reason si es necesario
    });
```

Dentro del componente:

```vue
<script setup>
const props = defineProps({ data: { type: Object, required: true } });

// Leer datos de entrada
const docType = props.data.rawData.documento.document_type;

// Cerrar con valor → va al .then()
props.data.callback.resolve('DOC-123');

// O cancelar → va al .catch()
props.data.callback.reject('Usuario canceló');
</script>
```

---

## Plantilla reutilizable: modal custom

Usa esta plantilla como base para nuevos modales. Respeta la prop `data` y usa `data.rawData`/`data.callback`.

`MiModalCustom.vue`:

```vue
<template>
    <div class="modal container">
        <div class="modal__header">
            <h1 class="controls__title">{{ title }}</h1>
            <div class="modal__close" @click="onCancel"><i class="fas fa-times"></i></div>
        </div>
        <div class="modal__body">
            <p class="mb-10">{{ message }}</p>

            <!-- Contenido del modal -->

            <div class="mt-15 d-flex justify-content-between">
                <button class="btn btn--small btn--gray-outline" type="button" @click.prevent="onCancel">
                    <i class="fas fa-times"></i>
                    Cancelar
                </button>
                <button class="btn btn--small btn--darkgray" type="button" @click.prevent="onAccept">
                    <i class="fas fa-check"></i>
                    Aceptar
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    data: { type: Object, required: true },
});

// Datos entrantes (pasados en open)
const title = props.data.rawData.title ?? 'Título';
const message = props.data.rawData.message ?? '';

// Handlers
const onAccept = () => {
    props.data.callback.resolve(props.data.rawData.payload ?? true);
};

const onCancel = () => {
    props.data.callback.reject('cancel');
};
</script>

<style lang="scss" scoped>
.modal {
    background-color: #ffffff;
    padding: 0;
    margin: 15px auto;
    border-radius: 8px;
    max-width: 500px;
    width: 100%;
    height: fit-content !important;
    animation: loading 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);

    &__header {
        padding: 20px 24px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #eee;
    }

    &__body {
        padding: 24px;
    }
}
@keyframes loading {
    0% { transform: translateY(20px) scale(0.95); opacity: 0; }
    100% { transform: translateY(0) scale(1); opacity: 1; }
}
</style>
```

Apertura del modal:

```js
import MiModalCustom from './MiModalCustom.vue';

const { promise } = window.awesomeModal.open({
    type: 'component',
    component: MiModalCustom,
    preventClose: false,
    title: 'Acción requerida',
    message: '¿Deseas continuar?',
    payload: { any: 'thing' }, // opcional; llegará como data.rawData.payload
});

promise
    .then((value) => {
        // value === payload (o true)
    })
    .catch(() => {
        // usuario canceló
    });
```

---

## Buenas prácticas

- Declara `data` como prop requerida en cada modal custom.
- Usa `data.rawData` solo para leer parámetros de entrada; si necesitas estado local, crea tu propio `reactive/ref`.
- Devuelve tipos simples y claros desde `resolve` (string, number, boolean u objeto con shape conocido).
- Maneja ambos caminos (`then`/`catch`) al abrir.
- Usa `preventClose` cuando un flujo no deba cerrarse accidentalmente.
- **No uses `type` como propiedad personalizada**; es reservada. Usa nombres como `docType`, `itemType`.

## Solución de problemas

- `data.rawData` aparece `undefined` en el componente:
  - Asegurate de que abriste con `type: 'component'` y definiste `component`.
  - Verificá que pasaste un objeto en `open(options)` y que el componente declara `props = { data: ... }`.
- El modal se cierra al presionar Escape/overlay:
  - Establecé `preventClose: true` en la llamada a `open`.
- Necesitás cerrar programáticamente desde fuera:
  - Usá `closeAll()` o conservá la referencia `{ resolve/reject }` retornada por `open`.

---

## Referencias en el repo

- `resources/js/dashboard-front-v2/components/Modal/index.vue` → creación de `window.awesomeModal`, manejo de overlay/Escape y stack de modales.
- `resources/js/views/configurations/personal-access-token/ModalNewToken.vue` → modal custom con resolve de objeto.
- `resources/js/views/data/custom-file-manager/Modals/RenameModal.vue` → modal custom que lee `data.rawData.item`.
- `resources/js/views/data/equipos-de-laboratorio/reservar/ModalCancelarReserva.vue` → modal con httpRequest interno.
- `resources/js/views/data/email-template/ModalPreview.vue` → modal de visualización (iframe).
