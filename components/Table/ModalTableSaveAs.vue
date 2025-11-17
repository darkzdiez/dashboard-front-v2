<template>
    <div class="modal container">
        <div class="modal__header">
            <h1 class="controls__title">Guardar vista como</h1>
            <div class="modal__close" @click="close">
                <i class="fas fa-times"></i>
            </div>
        </div>
        <div class="modal__body">
            <div class="grid-1 gap-10">
                <InputText
                    label="Nombre de la vista"
                    placeholder=""
                    v-model="name"
                    :error="[]"
                    class="col-1 input--small"
                />
            </div>
            <div class="modal__buttons col-2 mt-15">
                <button
                    class="btn btn--rounded btn--primary-outline"
                    type="button"
                    @click.prevent="close"
                >
                    Volver
                </button>
                <button
                    class="btn btn--rounded btn--primary"
                    type="button"
                    @click.prevent="save"
                >
                    Guardar
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
    data: {
        type: Object,
        required: true,
    },
});

const name = ref('');

const close = () => {
    props.data.callback.reject('Close on overlay click');
};

const save = () => {
    props.data.callback.resolve({
        table_view_uuid: null,
        table_view_name: name.value,
    });
};
</script>

<style lang="scss" scoped>
.modal {
    background-color: #ffffff;
    padding: 0;
    // min-height: calc(100% - 30px);
    margin-top: 15px;
    margin-bottom: 15px;

    max-height: calc(100vh - 30px);
    overflow: auto;

    height: 239px;
    min-height: 239px;
    width: 360px;
    max-width: 100%;
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
        justify-content: space-between;
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
