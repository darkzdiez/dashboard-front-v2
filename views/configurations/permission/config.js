import Add from './Add.vue';
import Edit from './Edit.vue';
import Home from './Home.vue';
import Layout from './Layout.vue';

export const routes = {
    path: '/permission',
    component: Layout,
    meta: {
        displayName: 'Permisos',
    },
    children: [
        {
            path: '',
            component: Home,
        },
        {
            path: 'add',
            component: Add,
            meta: {
                displayName: 'Agregar',
            },
        },
        {
            path: ':id/edit',
            component: Edit,
            meta: {
                displayName: 'Editar',
            },
        },
    ],
};
