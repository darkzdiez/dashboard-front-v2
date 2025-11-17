import Edit from './Edit.vue';
import Home from './Home.vue';
import Layout from './Layout.vue';

export const routes = {
    path: '/calendario',
    component: Layout,
    meta: {
        displayName: 'Calendario',
    },
    children: [
        {
            path: '',
            component: Home,
        },
        {
            path: ':id/show',
            component: Edit,
            meta: {
                displayName: 'Editar',
            },
        },
    ],
};
