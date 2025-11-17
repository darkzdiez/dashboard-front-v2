# Guía de uso de `awesomeModal` (confirm2, alert y modales custom con open)

Documentos relacionados:
- [Guía httpRequest y dataPaginator](./httpRequest-dataPaginator.md)

Esta guía explica cómo usar `awesomeModal` para:
- confirmaciones con `confirm2`.
- avisos con `alert`.
- y sobre todo cómo abrir modales personalizados con `open`, cómo estructurar el componente, pasar datos y leerlos con `data.rawData`.

Basado en los archivos:
- `resources/js/dashboard-front-v2/components/Modal/index.vue` (provee `window.awesomeModal`).
- `resources/js/views/contabilizacion-documentos/Home.vue` (ejemplo de apertura de modal custom).
- `resources/js/views/contabilizacion-documentos/ModalContabilizarDocumento.vue` (ejemplo de modal custom).

---

## API rápida

`awesomeModal` está disponible de forma global en `window.awesomeModal` y expone:

- `open(options)` → retorna un objeto `{ promise, resolve, reject, close }`.
  - Permite abrir distintos tipos de modal. Para modales custom, usa `type: 'component'` y `component: TuComponente`.
  - Todo lo que envíes en `options` estará disponible dentro del componente como `data.rawData`.
- `alert(title, message, buttons?)` → Promise que se resuelve al cerrar.
- `confirm2(title, message, buttons?)` → Promise que se resuelve con el valor del botón elegido.
- `closeAll()` → cierra todos los modales abiertos.
- Presets adicionales: `loading`, `error`, `success`.

Notas de cierre y prevención:
- Si `preventClose` es `true`, NO se cierra por overlay ni por la tecla Escape.
- Si `preventClose` es `false` (por defecto), overlay y Escape llaman `reject()`.
- Al cambiar de ruta, se ejecuta `closeAll()` (ver guard en `index.vue`).

---

## confirm2: confirmación estilizada

`confirm2` muestra un diálogo con dos botones por defecto (Cancelar/Aceptar) y resuelve con el valor del botón.

```js
window.awesomeModal
  .confirm2(
    'Confirmar cancelación de contabilización',
    '¿Estás seguro de cancelar la contabilización?',
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

Personalización:
- Cambia `buttons` para variar `content` (HTML), `class` y `value` (lo que se resuelve).

---

## alert: avisos simples

`alert` muestra un mensaje con un botón “Aceptar” por defecto y resuelve al cerrar.

```js
window.awesomeModal
  .alert('Contabilización confirmada', 'La contabilización ha sido confirmada correctamente')
  .then(() => {
    // Cerrado por el usuario
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

### Ejemplo de apertura (desde una vista)

Tomado de `resources/js/views/contabilizacion-documentos/Home.vue`:

```js
import ModalContabilizarDocumento from './ModalContabilizarDocumento.vue';

const promiseModal = window.awesomeModal.open({
  type: 'component',
  component: ModalContabilizarDocumento,
  preventClose: true,
  documento, // dato libre
  item,      // dato libre
});

promiseModal.promise.then((docContable) => {
  // docContable es lo que el modal devuelve vía callback.resolve(...)
});
```

### Estructura del componente custom

Tu componente debe:
- Declarar la prop `data` como requerida.
- Leer los datos de entrada desde `data.rawData`.
- Cerrar usando `data.callback.resolve(value)` o `data.callback.reject(reason)`.

Fragmentos basados en `ModalContabilizarDocumento.vue`:

Template (acceso a `data.rawData`):

```vue
<div class="text-center">
  ¿Estas seguro de confirmar la contabilización de
  <strong>{{ data.rawData.documento.document_type }}</strong>
  para el despacho n° <strong>{{ data.rawData.item.numero_despacho }}</strong>?
</div>
```

Script (manejo de callback y validación):

```vue
<script setup>
import { reactive } from 'vue';

const props = defineProps({
  data: { type: Object, required: true },
});

const form = reactive({ documento_contable: '' });
const errors = reactive({ documento_contable: '' });

const close = () => {
  props.data.callback.reject('Cerrado por el usuario');
};

const submit = () => {
  if (!form.documento_contable.trim()) {
    errors.documento_contable = 'Este campo es obligatorio';
    return;
  }
  props.data.callback.resolve(form.documento_contable);
};
</script>
```

Comportamiento y UX:
- Usa `preventClose: true` cuando haya que completar acciones obligatorias.
- Si `preventClose` es `false`, overlay y Escape llaman `reject()` (motivos: 'Close on overlay click' y 'Close on escape key').

---

## Ejemplo completo de ida y vuelta

Apertura y manejo de resultados:

```js
const { promise } = window.awesomeModal.open({
  type: 'component',
  component: ModalContabilizarDocumento,
  preventClose: true,
  documento,
  item,
});

promise
  .then((documentoContable) => {
    // Éxito: usar documentoContable
  })
  .catch((reason) => {
    // Cancelación o cierre: manejar reason si es necesario
  });
```

Dentro del componente (lectura y cierre):

```vue
<script setup>
const props = defineProps({ data: { type: Object, required: true } });

// Leer
const docType = props.data.rawData.documento.document_type;

// Cerrar con valor
props.data.callback.resolve('DOC-123');

// O cancelar
props.data.callback.reject('Usuario canceló');
</script>
```

---

## Plantilla reutilizable: modal custom minimalista

Usa esta plantilla como base para nuevos modales. Respeta la prop `data` y usa `data.rawData`/`data.callback`.

`MinimalCustomModal.vue`:

```vue
<template>
  <div class="modal container">
    <div class="modal__header">
      <h1 class="controls__title">{{ title }}</h1>
      <div class="modal__close" @click="onCancel"><i class="fas fa-times"></i></div>
    </div>
    <div class="modal__body">
      <p class="mb-10">{{ message }}</p>

      <!-- Contenido opcional -->
      <slot />

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
  // Devuelve un payload opcional al llamador
  props.data.callback.resolve(props.data.rawData.payload ?? true);
};

const onCancel = () => {
  props.data.callback.reject('cancel');
};
</script>

<style scoped>
.modal { background: #fff; }
</style>
```

Apertura del modal minimalista:

```js
import MinimalCustomModal from '@/path/a/MinimalCustomModal.vue';

const { promise } = window.awesomeModal.open({
  type: 'component',
  component: MinimalCustomModal,
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

## Solución de problemas

- `data.rawData` aparece `undefined` en el componente:
  - Asegúrate de que abriste con `type: 'component'` y definiste `component`.
  - Verifica que pasaste un objeto en `open(options)` y que el componente declara `props = { data: ... }`.
- El modal se cierra al presionar Escape/overlay:
  - Establece `preventClose: true` en la llamada a `open`.
- Necesitas cerrar programáticamente desde fuera:
  - Usa `closeAll()` o conserva la referencia `{ resolve/reject }` retornada por `open`.

---

## Referencias en el repo

- `resources/js/dashboard-front-v2/components/Modal/index.vue` → creación de `window.awesomeModal`, manejo de overlay/Escape y stack de modales.
- `resources/js/views/contabilizacion-documentos/Home.vue` → ejemplo de `open` con `ModalContabilizarDocumento`.
- `resources/js/views/contabilizacion-documentos/ModalContabilizarDocumento.vue` → ejemplo de componente custom que utiliza `data.rawData` y `data.callback`.
