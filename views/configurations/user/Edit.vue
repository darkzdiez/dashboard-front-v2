<script setup>
import { reactive } from 'vue';
import FormLayout from './FormLayout.vue';
// import { required, email, validate } from '../../libs/validate'
import { useRoute, useRouter } from 'vue-router';

const router = useRouter() || window.appDependencies?.router;
const route = useRoute() || router?.currentRoute?.value;

const form = reactive({
    name: '',
    username: '',
    email: '',
    password: '',
    // root: 0,
    organization_id: null,
    groups: [],
    login_with_password: 1,
    login_with_google: 0,
    access_testing: 0,
    access_production: 0,
});

const errors = reactive({
    name: [],
    username: [],
    email: [],
    password: [],
    // root: [],
    organization_id: [],
    groups: [],
});
let modal = awesomeModal.loading();
httpRequest({
    url: window.public_path + '/api/user/' + (route?.params?.id || ''),
    method: 'GET',
})
    .then((data) => {
        form.name = data.name;
        form.username = data.username;
        form.email = data.email;
        // form.root     = data.root
        form.organization_id = data.organization_id;
        Object.assign(form.groups, data.groups);
        form.login_with_password = data.login_with_password ?? 1;
        form.login_with_google = data.login_with_google ?? 0;
        form.access_testing = data.access_testing ?? 0;
        form.access_production = data.access_production ?? 0;
        modal.close();
    })
    .catch((error) => {
        modal.close();
    });

const onSubmit = () => {
    let modal = awesomeModal.loading();
    var form_data = new FormData();

    form_data.append('name', form.name);
    form_data.append('username', form.username);
    form_data.append('email', form.email);
    form_data.append('password', form.password);
    // form_data.append("root",     form.root);
    form_data.append('organization_id', form.organization_id);
    form_data.append('groups', form.groups);
    form_data.append('login_with_password', form.login_with_password ? 1 : 0);
    form_data.append('login_with_google', form.login_with_google ? 1 : 0);
    form_data.append('access_testing', form.access_testing ? 1 : 0);
    form_data.append('access_production', form.access_production ? 1 : 0);

    // clear all errors
    Object.keys(errors).forEach((key) => {
        errors[key].splice(0, errors[key].length);
    });
    httpRequest({
        url: window.public_path + '/api/user/store/' + (route?.params?.id || ''),
        method: 'POST',
        data: form_data,
        errors: errors,
    })
        .then((data) => {
            modal.close();
            router.push('/user');
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
                    @click="$goBack('/user')"
                    class="btn-back"
                    type="button"
                >
                    <i class="fas fa-arrow-left"></i>
                </button>
                <span>Editar Usuario</span>
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
