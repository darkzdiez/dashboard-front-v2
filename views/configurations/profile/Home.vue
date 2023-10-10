<script setup>
    import { reactive } from 'vue'
    import { useRoute, useRouter } from 'vue-router'

    const route = useRoute()
    const router = useRouter()
    
    const form = reactive({
        name: '',
        username: '',
        email: '',

        password: '',
        password_confirmation: '',
    })

    const errors = reactive({
        name: [],
        username: [],
        email: [],

        password: [],
        password_confirmation: [],
    })
    let modal = awesomeModal.loading()
    httpRequest({
        url: window.public_path + '/api/profile',
        method: 'GET',
    })
    .then((data) => {
        form.name     = data.name
        form.username = data.username
        form.email    = data.email

        modal.close()
    })
    .catch((error) => {
        modal.close()
    })

    const editProfile = () => {
        let modal = awesomeModal.loading()
        var form_data = new FormData();

        form_data.append("name",     form.name);
        form_data.append("username", form.username);
        form_data.append("email",    form.email);
        // clear all errors
        Object.keys(errors).forEach(key => {
            errors[key].splice(0, errors[key].length)
        })
        httpRequest({
            url: window.public_path + '/api/profile',
            method: 'POST',
            data: form_data,
            errors: errors,
        })
        .then((data) => {
            modal.close()
        })
        .catch((error) => {
            modal.close()
        })

    }

    const changePassword = () => {
        let modal = awesomeModal.loading()
        var form_data = new FormData();

        form_data.append("password",              form.password);
        form_data.append("password_confirmation", form.password_confirmation);
        // clear all errors
        Object.keys(errors).forEach(key => {
            errors[key].splice(0, errors[key].length)
        })
        httpRequest({
            url: window.public_path + '/api/profile/change-password',
            method: 'POST',
            data: form_data,
            errors: errors,
        })
        .then((data) => {
            modal.close()
        })
        .catch((error) => {
            modal.close()
        })

    }
</script>
<template>
    <Main>
        <SectionHeader>
            <template #title>
                Editar Perfil
            </template>
            <template #buttons>
                <router-link
                    to="/user"
                    class="btn btn--yellow"
                >
                    <i class="fas fa-arrow-left"></i> Volver
                </router-link>
            </template>
        </SectionHeader>
        <form
            @submit.prevent="editProfile"
            style="background-color: #FFF; padding: 10px 35px 35px 35px;" class="mb-25"
        >
            <h3>Datos básicos</h3>
            <div class="grid-2 gap-15">
                <InputText
                    label="Nombre"
                    placeholder=""
                    v-model="form.name"
                    :error="errors.name"
                    class="col-1"
                />
                <InputText
                    label="Nombre de Usuario"
                    placeholder=""
                    v-model="form.username"
                    :error="errors.username"
                    class="col-1"
                />
                <InputText
                    label="Email"
                    placeholder=""
                    v-model="form.email"
                    :error="errors.email"
                    class="col-2"
                />
                <div class="col-2">
                    <button
                        class="btn btn--green"
                        type="submit"
                    >
                        <i class="fas fa-save"></i> Guardar
                    </button>
                </div>
            </div>
        </form>
        <form
            @submit.prevent="changePassword"
            style="background-color: #FFF; padding: 10px 35px 35px 35px;" class="mb-25"
        >
            <h3>Cambio de contraseña</h3>
            <div class="grid-2 gap-15">
                <InputText
                    label="Nueva Contraseña"
                    placeholder=""
                    v-model="form.password"
                    :error="errors.password"
                    type="password"
                    class="col-1"
                />
                <InputText
                    label="Confirmar Nueva Contraseña"
                    placeholder=""
                    v-model="form.password_confirmation"
                    :error="errors.password_confirmation"
                    type="password"
                    class="col-1"
                />
                <div class="col-2">
                    <button
                        class="btn btn--green"
                        type="submit"
                    >
                        <i class="fas fa-save"></i> Guardar
                    </button>
                </div>
            </div>
        </form>
    </Main>
</template>


<style lang="scss" scoped>
</style>
