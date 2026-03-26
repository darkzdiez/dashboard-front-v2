<template>
    <div class="debug-dump-preview">
        <div class="debug-dump-preview__header">
            <div>
                <h2 class="debug-dump-preview__title">
                    {{ data.rawData.title || 'Se detectó un dd() en el backend' }}
                </h2>
                <p class="debug-dump-preview__meta">
                    <span v-if="data.rawData.status">
                        HTTP {{ data.rawData.status }}
                    </span>
                    <span v-if="data.rawData.requestUrl">
                        · {{ data.rawData.requestUrl }}
                    </span>
                </p>
            </div>
            <div class="debug-dump-preview__actions">
                <button
                    class="btn btn--darkgray-outline"
                    type="button"
                    @click="copyDump"
                >
                    Copiar
                </button>
                <button
                    class="btn btn--darkgray"
                    type="button"
                    @click="data.callback.resolve(true)"
                >
                    Cerrar
                </button>
            </div>
        </div>

        <iframe
            v-if="isHtmlDump"
            class="debug-dump-preview__frame"
            :srcdoc="data.rawData.html"
            sandbox="allow-scripts"
            title="Laravel debug dump"
        ></iframe>

        <pre v-else class="debug-dump-preview__text">{{
            data.rawData.text || 'Sin contenido para mostrar.'
        }}</pre>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    data: {
        type: Object,
        required: true,
    },
});

const isHtmlDump = computed(() => {
    return Boolean(props.data?.rawData?.html);
});

const copyDump = async () => {
    const rawDump =
        props.data?.rawData?.text || props.data?.rawData?.html || '';

    if (!rawDump) {
        return;
    }

    try {
        await navigator.clipboard.writeText(rawDump);
        window.awesomeModal.success(
            'Dump copiado',
            'El contenido del dd() se copió al portapapeles.',
            3
        );
    } catch (error) {
        window.awesomeModal.alert(
            'Copiado manual',
            'No se pudo copiar automáticamente. Copialo manualmente desde la vista previa.'
        );
    }
};
</script>

<style lang="scss" scoped>
.debug-dump-preview {
    width: min(96vw, 1400px);
    height: min(90vh, 900px);
    background: #ffffff;
    display: flex;
    flex-direction: column;
    border-radius: 6px;
    overflow: hidden;
    box-shadow: 0 18px 50px rgba(0, 0, 0, 0.35);

    &__header {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        align-items: flex-start;
        padding: 16px 18px;
        border-bottom: 1px solid #e5e7eb;
    }

    &__title {
        margin: 0;
        font-size: 18px;
    }

    &__meta {
        margin: 6px 0 0;
        color: #6b7280;
        font-size: 13px;
        word-break: break-all;
    }

    &__actions {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        justify-content: flex-end;
    }

    &__frame {
        width: 100%;
        height: 100%;
        border: 0;
        background: #fff;
    }

    &__text {
        margin: 0;
        padding: 18px;
        height: 100%;
        overflow: auto;
        background: #111827;
        color: #f9fafb;
        font-size: 13px;
        line-height: 1.5;
        white-space: pre-wrap;
        word-break: break-word;
    }
}
</style>
