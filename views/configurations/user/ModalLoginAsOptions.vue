<template>
    <div class="modal container">
        <div class="modal__header">
            <h1 class="controls__title">Opciones de acceso</h1>
            <div class="modal__close" @click="onCancel">
                <i class="fas fa-times"></i>
            </div>
        </div>

        <div class="modal__body">
            <p class="mb-10">
                Usuario objetivo:
                <strong>{{ targetUserName }}</strong>
            </p>

            <div class="mb-15">
                <button
                    class="btn btn--darkgray"
                    type="button"
                    @click="onDirectLogin"
                >
                    <i class="fas fa-sign-in-alt"></i>
                    Ingresar ahora como este usuario
                </button>
            </div>

            <hr class="mb-15" />

            <div class="mb-10">
                <label for="expiration-minutes" class="d-block mb-5"
                    >Generar enlace temporal</label
                >
                <div class="d-flex align-items-center gap-10">
                    <select
                        id="expiration-minutes"
                        v-model="expirationMinutes"
                        class="form-control"
                    >
                        <option
                            v-for="minute in expirationOptions"
                            :key="minute"
                            :value="minute"
                        >
                            {{ minute }} minuto{{ minute > 1 ? 's' : '' }}
                        </option>
                    </select>
                    <button
                        class="btn btn--primary"
                        type="button"
                        @click="generateLoginLink"
                        :disabled="isGenerating"
                    >
                        <i class="fas fa-link"></i>
                        Generar link
                    </button>
                </div>
            </div>

            <div v-if="generatedLink" class="mt-10">
                <p class="mb-5">
                    Enlace generado (vence: {{ expiresAtLabel }}):
                </p>
                <textarea
                    class="form-control"
                    rows="3"
                    readonly
                    :value="generatedLink"
                ></textarea>
                <div class="mt-10">
                    <button class="btn btn--gray" type="button" @click="copyLink">
                        <i class="fas fa-copy"></i>
                        Copiar link
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
    data: {
        type: Object,
        required: true,
    },
});

const expirationOptions = [1, 2, 3, 5, 10];
const expirationMinutes = ref(5);
const generatedLink = ref('');
const expiresAt = ref('');
const isGenerating = ref(false);

const targetUserName = computed(() => props.data.rawData.userName ?? 'Usuario');

const expiresAtLabel = computed(() => {
    if (!expiresAt.value) {
        return '-';
    }

    const date = new Date(expiresAt.value);
    if (Number.isNaN(date.getTime())) {
        return expiresAt.value;
    }

    return new Intl.DateTimeFormat('es-AR', {
        dateStyle: 'short',
        timeStyle: 'medium',
    }).format(date);
});

const onCancel = () => {
    props.data.callback.reject('cancel');
};

const onDirectLogin = () => {
    props.data.callback.resolve({
        action: 'direct-login',
    });
};

const generateLoginLink = () => {
    isGenerating.value = true;

    const formData = new FormData();
    formData.append('target_id', props.data.rawData.userUuid);
    formData.append('expiration_minutes', expirationMinutes.value);

    const loadingModal = awesomeModal.loading();
    httpRequest({
        url: window.public_path + '/api/user/login-as-link/generate',
        method: 'POST',
        data: formData,
    })
        .then((data) => {
            generatedLink.value = data?.link ?? '';
            expiresAt.value = data?.expires_at ?? '';
            loadingModal.close();
            isGenerating.value = false;
        })
        .catch(() => {
            loadingModal.close();
            isGenerating.value = false;
        });
};

const copyLink = async () => {
    if (!generatedLink.value) {
        return;
    }

    try {
        await navigator.clipboard.writeText(generatedLink.value);
        awesomeModal.success('Link copiado', 'El enlace fue copiado al portapapeles.', 5);
    } catch (error) {
        awesomeModal.alert('Copiado manual', 'No se pudo copiar automáticamente. Copialo manualmente desde el campo.');
    }
};
</script>

<style lang="scss" scoped>
.gap-10 {
    gap: 10px;
}
</style>
