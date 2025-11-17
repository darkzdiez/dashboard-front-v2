<template>
    <div class="modal container">
        <div class="modal__header">
            <h1 class="controls__title">Supervisor</h1>
            <div class="modal__close" @click="close">
                <i class="fas fa-times"></i>
            </div>
        </div>
        <div class="modal__body grid-1 gap-15">
            <button
                class="btn btn--extra-large btn--darkgray-outline"
                @click="restart()"
            >
                <i class="fas fa-redo-alt me-10"></i>
                Reiniciar Tiempo Trabajo
            </button>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    data: {
        type: Object,
        required: true,
    },
});
const close = () => {
    // props.data.callback.reject('Close on overlay click')
    props.data.callback.resolve('closed');
};

const restart = () => {
    window.awesomeModal
        .confirm(
            '¿Está seguro?',
            '¿Está seguro que desea reiniciar el tiempo de trabajo?'
        )
        .then((result) => {
            if (result) {
                props.data.callback.resolve('reiniciar');
            }
        });
};
</script>

<style lang="scss" scoped>
.modal {
    background-color: #ffffff;
    padding: 0;
    max-height: calc(100vh - 100px);
    min-height: 100px;
    height: 450px;
    max-width: 450px;
    overflow: auto;
    &__header {
        padding: 30px 24px 20px 24px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    &__close {
        cursor: pointer;
        font-size: 25px;
        transition: all 0.3s ease;
        color: #656565;
        &:hover {
            color: #000;
        }
    }
    &__body {
        padding: 0 24px 42px 24px;
    }
    &__buttons {
        display: flex;
        gap: 15px;
        margin-left: auto;
        align-items: center;
        justify-content: center;
        width: 100%;
    }
}
.modal {
    animation: loading 0.5s ease-in-out;
    @keyframes loading {
        0% {
            transform: translate(0px, 1000px) scale(0.3);
        }
        100% {
            transform: translate(0px, 0px) scale(1);
        }
    }
}
.item {
    &__label {
        font-weight: 400;
        font-size: 16px;
        line-height: 19px;
        color: #919191;
        margin-bottom: 7.5px;
    }
    &__value {
        font-weight: 500;
        font-size: 16px;
        line-height: 19px;
        color: #0c0c0c;
    }
}
</style>
