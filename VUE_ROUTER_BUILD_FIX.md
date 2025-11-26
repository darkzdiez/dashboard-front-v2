# Solución a Errores de Build con Vue Router

## El Problema
Durante la ejecución de `pnpm build`, se presentaban errores del tipo:
- `TypeError: Cannot read properties of undefined (reading 'beforeEach')`
- `TypeError: Cannot read properties of undefined (reading 'matched')`
- `TypeError: Cannot read properties of undefined (reading 'params')`

## La Causa
Estos errores ocurren porque Vite (y el plugin de Vue) intentan analizar o pre-renderizar los componentes de manera estática durante el proceso de construcción ("build time"). En este entorno:
1.  No existe un navegador real ni una navegación activa completa.
2.  Las funciones `useRouter()` y `useRoute()` de `vue-router` pueden devolver `undefined` o un objeto vacío, ya que el router no está inyectado en el contexto de la misma manera que en la aplicación en ejecución ("runtime").
3.  Al intentar acceder a propiedades como `.params`, `.matched` o métodos como `.beforeEach()` directamente en el nivel superior del `<script setup>`, el código se ejecuta inmediatamente al importar el módulo, lanzando el error si la variable es `undefined`.

## La Solución
Se implementó una estrategia de "código defensivo" para asegurar que el build no falle, manteniendo la funcionalidad en producción.

### 1. Fallback para `router` y `route`
Si `useRouter()` o `useRoute()` fallan (devuelven undefined), intentamos obtener la instancia desde `window.appDependencies` (que se configura en el punto de entrada de la aplicación) o derivarla de manera segura.

**Antes:**
```javascript
const router = useRouter();
const route = useRoute();
```

**Después:**
```javascript
const router = useRouter() || window.appDependencies?.router;
const route = useRoute() || router?.currentRoute?.value;
```

### 2. Acceso Seguro (Optional Chaining)
Se protegió el acceso a propiedades anidadas utilizando el operador de encadenamiento opcional (`?.`) y valores por defecto.

**Antes:**
```javascript
httpRequest({
    url: window.public_path + '/api/user/' + route.params.id,
    // ...
})
```

**Después:**
```javascript
httpRequest({
    url: window.public_path + '/api/user/' + (route?.params?.id || ''),
    // ...
})
```

### 3. Verificación de Existencia
Para métodos como `beforeEach` o iteraciones sobre `matched`, se envuelve el código en condicionales.

**Ejemplo:**
```javascript
if (router) {
    router.beforeEach((to, from, next) => {
        // ...
    });
}

if (route?.matched) {
    route.matched.forEach(...)
}
```

## Archivos Modificados
Se aplicaron estas correcciones en los siguientes archivos del paquete `dashboard-front-v2`:

1.  `components/Modal/index.vue`
2.  `components/Layouts/Main.vue`
3.  `views/configurations/user/Edit.vue`
4.  `views/calendar/Edit.vue`
5.  `views/configurations/cron/Edit.vue`
6.  `views/configurations/group/Edit.vue`
7.  `views/configurations/permission/Edit.vue`
