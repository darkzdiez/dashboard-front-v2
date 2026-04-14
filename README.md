# Dashboard Front V2

Biblioteca de componentes reutilizables Vue 3 para el dashboard.

## Instalación

```bash
pnpm add dashboard-front-v2
```

## Uso

```javascript
import { dashboardFront } from 'dashboard-front-v2';

// En tu aplicación Vue 3
dashboardFront({
    app,
    router,
    reactive,
    ref,
    inject,
    watch,
    onMounted,
    watchEffect,
    computed,
    useRoute,
    useRouter,
    onBeforeRouteLeave,
    onBeforeRouteUpdate,
    RouterLink,
    RouterView,
});
```

## Componentes Incluidos

- SectionHeader
- Notes
- ButtonAlert
- Dropdown
- Main
- Paginator
- Modal
- TopBarJobs
- TopBarNews
- TableTh
- Inputs (registro completo)
- Boxes (registro completo)

## Documentación

- [Impersonación con link temporal](./docs/impersonacion-link-temporal.md)
- [httpRequest y dataPaginator](./docs/httpRequest-dataPaginator.md)
- [awesomeModal](./docs/awesomeModal.md)
- [Selección múltiple](./docs/multiple-selection-records.md)

## Desarrollo Local

Este paquete está configurado para trabajar con pnpm workspaces. Los cambios realizados en el paquete se reflejarán automáticamente en los proyectos que lo utilicen dentro del workspace.
