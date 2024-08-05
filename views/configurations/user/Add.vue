<script setup>
    import { reactive } from 'vue'
    import FormLayout from './FormLayout.vue'
    import { useRoute, useRouter } from 'vue-router'

    const route = useRoute()
    const router = useRouter()

    const form = reactive({
        name: '',
        username: '',
        email: '',
        password: '',
        // root: 0,
        organization_id: null,
        groups: [],
    })
    const errors = reactive({
        name: [],
        username: [],
        email: [],
        password: [],
        // root: [],
        organization_id: [],
        groups: [],
    })

    const onSubmit = () => {
        let modal = awesomeModal.loading()
        var form_data = new FormData();

        form_data.append("name",     form.name);
        form_data.append("username", form.username);
        form_data.append("email",    form.email);
        form_data.append("password", form.password);
        // form_data.append("root",     form.root);
        form_data.append("organization_id", form.organization_id);
        form_data.append("groups",   form.groups);

        // clear all errors
        Object.keys(errors).forEach(key => {
            errors[key].splice(0, errors[key].length)
        })

        httpRequest({
            url: window.public_path + '/api/user/store',
            method: 'POST',
            data: form_data,
            errors: errors,
        })
        .then((data) => {
            modal.close()
            router.push('/user')
        })
        .catch((error) => {
            modal.close()
        })

    }
</script>
<template>
    <form @submit.prevent="onSubmit">
        <SectionHeader>
            <template #title>
                Añadir un Usuario
            </template>
            <template #buttons>
                <router-link
                    to="/user"
                    class="btn btn--yellow"
                >
                    <i class="fas fa-arrow-left"></i> Volver
                </router-link>
                <button
                    class="btn btn--green"
                    type="submit"
                >
                    <i class="fas fa-save"></i> Guardar
                </button>
            </template>
        </SectionHeader>
        <FormLayout
            :form="form"
            :errors="errors"
        />
    </form>
</template>


<style lang="scss" scoped>
</style>
