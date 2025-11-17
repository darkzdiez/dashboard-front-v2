<template>
    <div class="modal container">
        <div class="modal__header">
            <h1 class="controls__title">{{ props.data.rawData.title }}</h1>
            <div class="modal__close" @click="close">
                <i class="fas fa-times"></i>
            </div>
        </div>
        <div class="modal__body grid-4 gap-15">
            <!--
            <InputSelect
                label="Tipo de Archivo"
                placeholder=""
                v-model="form.tipo_archivo"
                :options="[
                    { value: 'any', label: 'Otro tipo de Archivo' },
                    { value: 'remito', label: 'Remito' },
                    { value: 'carga-ventanas', label: 'Carga de Ventanas' },
                ]"
                :error="errors.tipo_archivo"
                class="col-1"
            >
                <template #option="{ value, label }">
                    <option :value="value">
                        {{ label }}
                    </option>
                </template>
            </InputSelect>
            -->
            <InputText
                label="Titulo"
                placeholder=""
                v-model="form.title"
                :error="errors.title"
                class="col-4"
                v-if="props.data.rawData.useInputTitle"
            />
            <wysiwyg-editor v-model="form.content" class="col-4" />
            <div class="modal__buttons col-4 mt-15">
                <button
                    class="btn btn--rounded btn--red"
                    type="button"
                    @click.prevent="close"
                >
                    <i class="fas fa-times"></i>
                    Cancelar
                </button>
                <button
                    class="btn btn--rounded btn--lightblue"
                    type="button"
                    @click.prevent="onSubmit"
                >
                    <i class="fas fa-save"></i>
                    Guardar
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { reactive } from 'vue';

const props = defineProps({
    data: {
        type: Object,
        required: true,
    },
});
const form = reactive({
    id: null,
    title: '',
    content: '',
});
const errors = reactive({
    title: [],
    content: [],
});

const close = () => {
    props.data.callback.reject('Close on overlay click');
};
/*
    const datosFacturacion = reactive([])

    httpRequest({
        url: window.public_path + '/api/obra/datos-facturacion/' + route.params.id,
        method: 'GET',
    })
    .then((data) => {
        // limpiar el array
        datosFacturacion.splice(0, datosFacturacion.length)
        // agregar los nuevos datos
        datosFacturacion.push(...data)
    })
    .catch((error) => {})
    */

const onSubmit = () => {
    let modal = awesomeModal.loading();
    var form_data = new FormData();
    if (form.id) {
        form_data.append('id', form.id);
    } else {
        form_data.append('level', 'info');
        form_data.append('type', props.data.rawData.typeNote); // note, alert
    }
    if (props.data.rawData.useInputTitle) {
        form_data.append('title', form.title);
    }
    form_data.append('content', form.content);

    httpRequest({
        url:
            window.public_path +
            '/api/notes/' +
            props.data.rawData.area +
            '/' +
            props.data.rawData.refid,
        method: 'POST',
        data: form_data,
        errors: errors,
    })
        .then((data) => {
            modal.close();
            close();
        })
        .catch((error) => {
            modal.close();
        });
};
const find = (id) => {
    let modal = awesomeModal.loading();
    httpRequest({
        url: window.public_path + '/api/notes/' + id,
        method: 'GET',
    })
        .then((data) => {
            form.id = data.id;
            form.title = data.title;
            form.content = data.content;
            modal.close();
        })
        .catch((error) => {
            modal.close();
        });
};
if (props.data.rawData.id) {
    find(props.data.rawData.id);
}
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
