import Home from './Home.vue';
import Layout from './Layout.vue';

export const routes = {
    path: '/database',
    component: Layout,
    meta: {
        displayName: 'Base de datos',
    },
    children: [
        {
            path: '',
            component: Home,
        },
    ],
};
