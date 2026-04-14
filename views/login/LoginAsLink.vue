<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const status = ref('loading');
const message = ref('Estamos validando el enlace temporal.');

const title = computed(() => {
    if (status.value === 'loading') {
        return 'Ingresando...';
    }

    return 'No pudimos iniciar sesión';
});

const loginUrl = computed(() => {
    const baseUrl = (
        window.browser_base_url || window.location.origin
    ).replace(/\/$/, '');

    return `${baseUrl}/login`;
});

// Reuse the impersonated user's default landing route when the frontend
// receives a tokenized auth payload.
const resolveDestination = (response) => {
    return new URL(
        response?.data?.user?.default_home || '/',
        window.browser_base_url || window.location.origin
    ).toString();
};

// Legacy web apps can finish the impersonation through the backend GET route,
// which creates the web session and then redirects to the application home.
const buildBackendLoginAsUrl = (token) => {
    if (typeof window.apiUrl === 'function') {
        return window.apiUrl(`/api/user/login-as-link/${encodeURIComponent(token)}`);
    }

    const backendBaseUrl = (
        window.public_path || window.location.origin
    ).replace(/\/$/, '');

    return `${backendBaseUrl}/api/user/login-as-link/${encodeURIComponent(token)}`;
};

// Only fallback to the backend redirect when frontend and backend share the
// same origin. Otherwise the redirect would likely leave the active frontend.
const canFallbackToBackendRedirect = () => {
    const backendBaseUrl = (
        window.public_path || window.location.origin
    ).replace(/\/$/, '');
    const frontendBaseUrl = (
        window.browser_base_url || window.location.origin
    ).replace(/\/$/, '');

    return backendBaseUrl === frontendBaseUrl;
};

// Tokenized frontends own the session hydration through a consumer hook.
// The package only performs the exchange and redirects afterwards.
const startFrontendImpersonation = async (token) => {
    const formData = new FormData();
    formData.append('token', token);

    const response = await window.httpRequest({
        url: window.apiUrl('/api/user/login-as-link/exchange'),
        method: 'POST',
        data: formData,
        skipAuth: true,
        redirectOnUnauthorized: false,
        displayModalErrors: false,
    });

    await window.$globalState.applyImpersonationSession(response);
    window.location.replace(resolveDestination(response));
};

onMounted(async () => {
    const token =
        typeof route.query.token === 'string' ? route.query.token.trim() : '';

    if (!token) {
        status.value = 'error';
        message.value = 'El enlace no contiene un token válido.';
        return;
    }

    try {
        // SPA consumers such as separate frontends can hydrate their auth
        // state in-place. Legacy web apps will skip this branch.
        if (typeof window.$globalState?.applyImpersonationSession === 'function') {
            await startFrontendImpersonation(token);
            return;
        }

        // Same-origin web apps can delegate the final login step to the
        // backend session route without needing a token-aware auth store.
        if (!canFallbackToBackendRedirect()) {
            status.value = 'error';
            message.value =
                'Esta aplicación necesita un manejador de impersonación en frontend para abrir enlaces temporales.';
            return;
        }

        window.location.replace(buildBackendLoginAsUrl(token));
    } catch (error) {
        status.value = 'error';
        message.value =
            error?.message ||
            'El enlace de inicio de sesión no es válido o ya expiró.';
    }
});
</script>

<template>
    <section class="login-as-link-view">
        <div class="login-as-link-card">
            <h1>{{ title }}</h1>
            <p>{{ message }}</p>

            <a
                v-if="status === 'error'"
                :href="loginUrl"
                class="btn btn--darkgray mt-10"
            >
                Ir al login
            </a>
        </div>
    </section>
</template>

<style scoped>
.login-as-link-view {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: #f5f6fa;
}

.login-as-link-card {
    width: min(100%, 420px);
    padding: 24px;
    border-radius: 12px;
    background: #ffffff;
    box-shadow: 0 12px 32px rgba(15, 23, 42, 0.12);
    text-align: center;
}

.login-as-link-card h1 {
    margin-bottom: 12px;
}

.login-as-link-card p {
    margin: 0;
}
</style>