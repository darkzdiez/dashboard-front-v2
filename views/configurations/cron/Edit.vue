<script setup>
import { reactive } from 'vue';
import FormLayout from './FormLayout.vue';
// import { required, email, validate } from '../../libs/validate'
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const form = reactive({
    description: '',
    method: 'exec',
    command: '',
    minute: '*',
    hour: '*',
    day: '*',
    month: '*',
    day_of_week: '*',
    logs: [],
});
const errors = reactive({
    description: [],
    method: [],
    command: [],
    minute: [],
    hour: [],
    day: [],
    month: [],
    day_of_week: [],
});

httpRequest({
    url: window.public_path + '/api/cron/' + route.params.id,
    method: 'GET',
})
    .then((data) => {
        form.description = data.description;
        form.method = data.method;
        form.command = data.command;
        form.minute = data.minute;
        form.hour = data.hour;
        form.day = data.day;
        form.month = data.month;
        form.day_of_week = data.day_of_week;
        form.logs.push(...data.logs);
    })
    .catch((error) => {});

const onSubmit = () => {
    let modal = awesomeModal.loading();
    var form_data = new FormData();

    form_data.append('description', form.description);
    form_data.append('method', form.method);
    form_data.append('command', form.command);
    form_data.append('minute', form.minute);
    form_data.append('hour', form.hour);
    form_data.append('day', form.day);
    form_data.append('month', form.month);
    form_data.append('day_of_week', form.day_of_week);
    // clear all errors
    Object.keys(errors).forEach((key) => {
        errors[key].splice(0, errors[key].length);
    });

    httpRequest({
        url: window.public_path + '/api/cron/store/' + route.params.id,
        method: 'POST',
        data: form_data,
        errors: errors,
    })
        .then((data) => {
            modal.close();
            // router.push('/cron');
            window.location.reload();
        })
        .catch((error) => {
            modal.close();
        });
};

const executeNow = () => {
    window.awesomeModal
        .confirm(
            '¿Ejecutar ahora?',
            '¿Estás seguro de que deseas ejecutar esta tarea programada ahora?'
        )
        .then((result) => {
            if (result) {
                window.awesomeModal.loading();
                httpRequest({
                    url:
                        window.public_path +
                        '/api/cron/' +
                        route.params.id +
                        '/execute-now',
                    method: 'POST',
                })
                    .then((data) => {
                        window.awesomeModal.closeAll();
                        window.awesomeModal.alert(
                            'Tarea ejecutada correctamente'
                        );
                    })
                    .catch((error) => {
                        window.awesomeModal.closeAll();
                        if (error.response.status === 422) {
                            errors.name = error.response.data.errors.name;
                        }
                    });
            }
        });
};
</script>
<template>
    <form @submit.prevent="onSubmit">
        <SectionHeader>
            <template #title> Editar tarea programada </template>
            <template #buttons>
                <router-link to="/cron" class="btn btn--yellow">
                    <i class="fas fa-arrow-left"></i> Volver
                </router-link>
                <button
                    class="btn btn--green-outline"
                    type="button"
                    @click="executeNow"
                >
                    <i class="fas fa-play"></i> Ejecutar ahora
                </button>
                <button class="btn btn--green" type="submit">
                    <i class="fas fa-save"></i> Guardar
                </button>
            </template>
        </SectionHeader>
        <FormLayout :form="form" :errors="errors" />
    </form>
</template>

<style lang="scss" scoped></style>
