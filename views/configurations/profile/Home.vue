<script setup>
import { reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const form = reactive({
    name: '',
    username: '',
    email: '',

    password: '',
    password_confirmation: '',
});

const errors = reactive({
    name: [],
    username: [],
    email: [],

    password: [],
    password_confirmation: [],
});

const mustChangePassword =
    window?.$globalState?.auth?.user?.must_change_password === true;

const goToPasswordForm = () => {
    // Smoothly guide the user to the password change form when needed.
    document.getElementById('change-password-form')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
    });
};
let modal = awesomeModal.loading();
httpRequest({
    url: window.public_path + '/api/profile',
    method: 'GET',
})
    .then((data) => {
        form.name = data.name;
        form.username = data.username;
        form.email = data.email;

        modal.close();
    })
    .catch((error) => {
        modal.close();
    });

const editProfile = () => {
    let modal = awesomeModal.loading();
    var form_data = new FormData();

    form_data.append('name', form.name);
    form_data.append('username', form.username);
    form_data.append('email', form.email);
    // clear all errors
    Object.keys(errors).forEach((key) => {
        errors[key].splice(0, errors[key].length);
    });
    httpRequest({
        url: window.public_path + '/api/profile',
        method: 'POST',
        data: form_data,
        errors: errors,
    })
        .then((data) => {
            modal.close();
        })
        .catch((error) => {
            modal.close();
        });
};

const changePassword = () => {
    let modal = awesomeModal.loading();
    var form_data = new FormData();

    form_data.append('password', form.password);
    form_data.append('password_confirmation', form.password_confirmation);
    // clear all errors
    Object.keys(errors).forEach((key) => {
        errors[key].splice(0, errors[key].length);
    });
    httpRequest({
        url: window.public_path + '/api/profile/change-password',
        method: 'POST',
        data: form_data,
        errors: errors,
    })
        .then((data) => {
            awesomeModal.success(
                'Éxito',
                'Contraseña actualizada correctamente'
            );
            window.location.reload();

            modal.close();
        })
        .catch((error) => {
            modal.close();
        });
};
</script>
<template>
    <Main>
        <SectionHeader>
            <template #title> Editar Perfil </template>
            <template #buttons>
                <router-link to="/user" class="btn btn--yellow">
                    <i class="fas fa-arrow-left"></i> Volver
                </router-link>
            </template>
        </SectionHeader>
        <form
            @submit.prevent="editProfile"
            style="background-color: #fff; padding: 10px 35px 35px 35px"
            class="mb-25"
            v-if="!mustChangePassword"
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
                    <button class="btn btn--green" type="submit">
                        <i class="fas fa-save"></i> Guardar
                    </button>
                </div>
            </div>
        </form>
        <div v-if="mustChangePassword" class="must-change-banner">
            <span class="banner-icon">
                <i class="fas fa-exclamation-circle"></i>
            </span>
            <div class="banner-content">
                <h3>Por tu seguridad, actualiza tu contraseña</h3>
                <p>
                    Detectamos que necesitas cambiar tu contraseña. Tómate un
                    momento para actualizarla y mantener tu cuenta protegida.
                </p>
            </div>
        </div>
        <form
            @submit.prevent="changePassword"
            style="background-color: #fff; padding: 10px 35px 35px 35px"
            class="mb-25"
            id="change-password-form"
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
                    <button class="btn btn--green" type="submit">
                        <i class="fas fa-save"></i> Guardar
                    </button>
                </div>
            </div>
        </form>
    </Main>
</template>

<style lang="scss" scoped>
.must-change-banner {
    background: linear-gradient(135deg, #ffe5eb 0%, #ff9db1 45%, #ff5c7a 100%);
    border-radius: 14px;
    box-shadow: 0 12px 30px rgba(235, 77, 106, 0.25);
    padding: 22px 28px;
    display: flex;
    align-items: center;
    gap: 18px;
    color: #531221;
    margin-bottom: 30px;
    position: relative;
    overflow: hidden;
}

.must-change-banner::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(
        circle at top right,
        rgba(255, 255, 255, 0.55),
        transparent 55%
    );
    pointer-events: none;
}

.banner-icon {
    font-size: 32px;
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #b50a3b;
}

.banner-content {
    flex: 1;
    position: relative;
    z-index: 1;
}

.banner-content h3 {
    margin: 0 0 8px;
    font-size: 20px;
    font-weight: 600;
}

.banner-content p {
    margin: 0;
    font-size: 15px;
    line-height: 1.5;
}

.must-change-banner .btn {
    flex: 0 0 auto;
    position: relative;
    z-index: 1;
    font-weight: 600;
}

.btn--white {
    background-color: #fff;
    color: #b50a3b;
    border: none;
    box-shadow: 0 6px 18px rgba(181, 10, 59, 0.2);
    transition:
        transform 0.2s ease,
        box-shadow 0.2s ease;
}

.btn--white:hover {
    transform: translateY(-1px);
    box-shadow: 0 10px 24px rgba(181, 10, 59, 0.28);
}

.btn--white:active {
    transform: translateY(0);
    box-shadow: 0 4px 14px rgba(181, 10, 59, 0.2);
}
</style>
