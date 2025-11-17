<script setup>
import { reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import FormLayout from './FormLayout.vue';

const route = useRoute();
const router = useRouter();

const form = reactive({
    name: '',
    guard_name: 'web',
    description: '',
    permissions: [],
    notifications: [],
    parent_id: null,
});
const errors = reactive({
    name: [],
    guard_name: [],
    description: [],
    permissions: [],
    notifications: [],
    parent_id: [],
});

const onSubmit = () => {
    let modal = awesomeModal.loading();
    var form_data = new FormData();

    form_data.append('name', form.name);
    form_data.append('guard_name', form.guard_name);
    form_data.append('description', form.description);
    form_data.append('permissions', form.permissions);
    form_data.append('notifications', form.notifications);
    form_data.append('parent_id', form.parent_id);

    // clear all errors
    Object.keys(errors).forEach((key) => {
        errors[key].splice(0, errors[key].length);
    });

    httpRequest({
        url: window.public_path + '/api/group/store',
        method: 'POST',
        data: form_data,
        errors: errors,
    })
        .then((data) => {
            modal.close();
            router.push('/group');
        })
        .catch((error) => {
            modal.close();
        });
};
</script>
<template>
    <form @submit.prevent="onSubmit">
        <SectionHeader>
            <template #title>
                <button
                    @click="$goBack('/group')"
                    class="btn-back"
                    type="button"
                >
                    <i class="fas fa-arrow-left"></i>
                </button>
                <span>Añadir un Rol/Grupo</span>
            </template>
            <template #buttons>
                <button class="btn btn--primary" type="submit">
                    <i class="fas fa-save"></i> Guardar
                </button>
            </template>
        </SectionHeader>
        <FormLayout :form="form" :errors="errors" />
    </form>
</template>

<style lang="scss" scoped></style>
