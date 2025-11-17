<script setup>
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router';
import SideBar from '../SideBar/index.vue';
import TopBar from '../TopBar/index.vue';

import { inject, reactive, ref, watchEffect } from 'vue';

const $globalState = inject('$globalState');

const route = useRoute();
const router = useRouter();
const validRoutes = reactive([]);
window.route = route;
window.router = router;

window.validRoutes = validRoutes;
const breadcrumbBefore = ref([]);
const breadcrumbAfter = ref([]);

// Si se cambia de ruta, limpio el breadcrumb
onBeforeRouteUpdate(async (to, from) => {
    breadcrumbBefore.value.splice(0, breadcrumbBefore.value.length);
    breadcrumbAfter.value.splice(0, breadcrumbAfter.value.length);
});
const injectBreadcrumb = (values, location = 'before') => {
    if (Object.prototype.toString.call(values) !== '[object Array]') {
        values = [values];
    }
    if (location == 'before') {
        breadcrumbBefore.value.push(...values);
    } else {
        breadcrumbAfter.value.push(...values);
    }
};
const injectBreadcrumbBefore = (values) => {
    injectBreadcrumb(values, 'before');
};
const injectBreadcrumbAfter = (values) => {
    injectBreadcrumb(values, 'after');
};
const clearInjectBreadcrumb = () => {
    breadcrumbBefore.value.splice(0, breadcrumbBefore.value.length);
    breadcrumbAfter.value.splice(0, breadcrumbAfter.value.length);
};
const clearInjectBreadcrumbBefore = () => {
    breadcrumbBefore.value.splice(0, breadcrumbBefore.value.length);
};
const clearInjectBreadcrumbAfter = () => {
    breadcrumbAfter.value.splice(0, breadcrumbAfter.value.length);
};
window.injectBreadcrumb = injectBreadcrumb;
window.injectBreadcrumbBefore = injectBreadcrumbBefore;
window.injectBreadcrumbAfter = injectBreadcrumbAfter;
window.clearInjectBreadcrumb = clearInjectBreadcrumb;
window.clearInjectBreadcrumbBefore = clearInjectBreadcrumbBefore;
window.clearInjectBreadcrumbAfter = clearInjectBreadcrumbAfter;

watchEffect(() => {
    validRoutes.splice(0, validRoutes.length);
    route.matched.forEach((item) => {
        if (item.meta && item.meta.displayName && !item.meta.omitInBreadcrumb) {
            Object.keys(route.params).forEach((key) => {
                item.path = item.path.replace(':' + key, route.params[key]);
            });
            validRoutes.push(item);
        }
    });
    // primero tengo que invertir el array para que quede en el orden correcto
    breadcrumbBefore.value.reverse().forEach((item) => {
        validRoutes.unshift(item);
    });
    breadcrumbAfter.value.forEach((item) => {
        validRoutes.push(item);
    });
});
</script>

<template>
    <div class="main-app">
        <TopBar></TopBar>
        <div class="main-content">
            <div class="main-content__content">
                <div class="breadcrumb">
                    <div>
                        <span v-for="(matched, idx) in validRoutes" :key="idx">
                            <template v-if="idx < validRoutes.length - 1">
                                <RouterLink
                                    :to="matched.path"
                                    class="breadcrumb__item"
                                    >{{ matched.meta.displayName }}</RouterLink
                                >
                                <span
                                    class="breadcrumb__divider"
                                    v-if="
                                        idx !=
                                        Object.keys(validRoutes).length - 1
                                    "
                                >
                                    /
                                </span>
                            </template>
                            <template v-else>
                                <span class="breadcrumb__item">{{
                                    matched.meta.displayName
                                }}</span>
                            </template>
                        </span>
                    </div>
                </div>
                <div>
                    <slot></slot>
                </div>
            </div>
            <div
                class="main-content__overlay"
                :class="{
                    'main-content__overlay--show':
                        $globalState.sidebar.show.value ==
                        'side-bar__wrapper--show',
                }"
                @click="$globalState.sidebar.show.toggle"
            ></div>
            <SideBar></SideBar>
        </div>
    </div>
</template>

<style lang="scss" scoped></style>
