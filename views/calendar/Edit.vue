<script setup>
import { reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Form from './Form.vue';

const route = useRoute();
const router = useRouter();

const form = reactive({
    codigo_asis: '',
    codigo_sia: '',
});
const errors = reactive({
    codigo_asis: [],
    codigo_sia: [],
});
let modal = awesomeModal.loading();

httpRequest({
    url: window.public_path + '/api/codigos-presupuestarios/' + route.params.id,
    method: 'GET',
})
    .then((data) => {
        form.codigo_asis = data.codigo_asis;
        form.codigo_sia = data.codigo_sia;
        modal.close();
    })
    .catch((error) => {
        modal.close();
    });

const onSubmit = () => {
    let modal = awesomeModal.loading();
    var form_data = new FormData();

    form_data.append('codigo_asis', form.codigo_asis);
    form_data.append('codigo_sia', form.codigo_sia);

    if (route.meta.copy) {
        form_data.append('__form-input-copy', 1);
    }

    httpRequest({
        url:
            window.public_path +
            '/api/codigos-presupuestarios/store/' +
            route.params.id,
        method: 'POST',
        data: form_data,
        errors: errors,
    })
        .then((data) => {
            modal.close();
            router.push('/codigos-presupuestarios');
        })
        .catch((error) => {
            modal.close();
        });
};
</script>
<template>
    <form @submit.prevent="onSubmit">
        <SectionHeader>
            <template #title> Editar Códigos Presupuestarios </template>
            <template #buttons>
                <router-link
                    to="/codigos-presupuestarios"
                    class="btn btn--yellow"
                >
                    <i class="fas fa-arrow-left"></i> Volver
                </router-link>
                <button class="btn btn--green" type="submit">
                    <i class="fas fa-save"></i> Guardar
                </button>
            </template>
        </SectionHeader>
        <Form :form="form" :errors="errors" />
    </form>
</template>

<style lang="scss" scoped></style>
