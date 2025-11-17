<script setup>
import { reactive } from 'vue';
import Item from './Item.vue';
const modals = reactive([]);

const open = (data) => {
    const item = {
        type: data.type,
        title: data.title,
        message: data.message,
        icon: data.icon,
        iconColor: data.iconColor,
        buttons: data.buttons,
        component: data.component,
        preventClose: data.preventClose || false,
        rawData: data,
        callback: {},
    };
    item.callback.promise = new Promise((resolve, reject) => {
        Object.assign(item.callback, { resolve, reject });
    });

    const key = modals.push(item);

    item.callback.promise.then((response) => {
        // console.log('paso 2')
        modals[key - 1] = false;
    });
    item.callback.promise.catch((error) => {
        // console.log('paso 3')
        modals[key - 1] = false;
    });
    // close is alias for resolve
    item.callback.close = item.callback.resolve;

    item.overlayClick = () => {
        if (!item.preventClose) {
            item.callback.reject('Close on overlay click');
        }
    };

    // si presiona la tecla escape
    item.keydown = (event) => {
        if (event.key === 'Escape' && !item.preventClose) {
            item.callback.reject('Close on escape key');
        }
    };
    window.addEventListener('keydown', item.keydown);

    return item.callback;
};
const closeAll = () => {
    modals.splice(0, modals.length);
};
window.modals = modals;
window.awesomeModal = {};
window.awesomeModal.open = open;
window.awesomeModal.closeAll = closeAll;
window.awesomeModal.loading = (message = null) => {
    return open({
        type: 'loading',
        title: message ? message : 'Cargando',
        message: 'Espere un momento',
        icon: '<i class="fas fa-spinner fa-pulse"></i>',
        iconColor: 'var(--blue)',
    });
};
window.awesomeModal.error = (title, message) => {
    return open({
        type: 'loading',
        title: title,
        message: message,
        icon: '<i class="fas fa-exclamation-triangle"></i>',
        iconColor: 'var(--red)',
    });
};
window.awesomeModal.success = (title, message) => {
    return open({
        type: 'loading',
        title: title,
        message: message,
        icon: '<i class="fas fa-check"></i>',
        iconColor: 'var(--green)',
    });
};
window.awesomeModal.confirm = (
    title,
    message,
    buttons = [
        {
            content: '<i class="fas fa-times"></i> Cancelar',
            class: 'btn btn--red',
            value: false,
        },
        {
            content: '<i class="fas fa-check"></i> Aceptar',
            class: 'btn btn--green',
            value: true,
        },
    ]
) => {
    return open({
        type: 'confirm',
        title: title,
        message: message,
        icon: '<i class="far fa-question-circle"></i>',
        iconColor: 'var(--lightblue)',
        buttons: buttons,
    }).promise;
};

window.awesomeModal.confirm2 = (
    title,
    message,
    buttons = [
        {
            content: '<i class="fas fa-times"></i> Cancelar',
            class: 'btn btn--darkgray-outline',
            value: false,
        },
        {
            content: '<i class="fas fa-check"></i> Aceptar',
            class: 'btn btn--darkgray',
            value: true,
        },
    ]
) => {
    return open({
        type: 'confirm2',
        title: title,
        message: message,
        icon: '<i class="far fa-question-circle"></i>',
        iconColor: 'var(--lightblue)',
        buttons: buttons,
    }).promise;
};
// window.awesomeModal.confirm('hola', 'chao').then(value => console.log(value))

window.awesomeModal.alert = (
    title,
    message,
    buttons = [
        {
            content: '<i class="fas fa-check"></i> Aceptar',
            class: 'btn btn--green',
            value: true,
        },
    ]
) => {
    return open({
        type: 'alert',
        title: title,
        message: message,
        icon: '<i class="fas fa-exclamation-circle"></i>',
        iconColor: 'var(--yellow)',
        buttons: buttons,
    }).promise;
};

import { useRouter } from 'vue-router';
const router = useRouter();
router.beforeEach((to, from, next) => {
    if (to.path != from.path) {
        closeAll();
    }
    next();
});
</script>

<template>
    <Item v-for="(item, key) in modals" :data="item" :key="key"></Item>
</template>

<style lang="scss" scoped></style>
