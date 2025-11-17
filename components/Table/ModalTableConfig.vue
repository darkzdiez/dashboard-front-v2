<template>
    <div class="modal container">
        <div class="modal__header">
            <h1 class="controls__title">Filtros y columnas</h1>
            <div class="modal__close" @click="close">
                <i class="fas fa-times"></i>
            </div>
        </div>
        <div class="modal__body">
            <div
                style="
                    display: grid;
                    grid-template-columns: 100px 1fr;
                    gap: 13px 10px;
                "
            >
                <div class="col-1"></div>
                <div class="col-1">
                    <TableConfig
                        :pagination="data.rawData.pagination"
                        :columns="data.rawData.columns"
                        :permanentFilters="permanentFilters"
                        :apply="apply"
                    />
                </div>
                <hr class="col-2 m-0" />
                <div class="col-1">Filtros</div>
                <div class="col-1">
                    <Filters
                        :pagination="data.rawData.pagination"
                        :columns="data.rawData.columns"
                        :permanentFilters="permanentFilters"
                        :enableButtons="false"
                    />
                </div>
                <hr class="col-2 m-0" />
                <div class="col-1">Columnas</div>
                <div class="col-1">
                    <Layout
                        :pagination="data.rawData.pagination"
                        :columns="data.rawData.columns"
                        :enableButtons="false"
                    />
                </div>
            </div>

            <div class="modal__buttons col-2 mt-15">
                <button
                    class="btn btn--rounded btn--primary-outline"
                    type="button"
                    @click.prevent="close"
                >
                    Volver
                </button>
                <button
                    class="btn btn--rounded btn--primary"
                    type="button"
                    @click.prevent="confirmApply"
                >
                    Confirmar
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { reactive } from 'vue';
import Filters from './Filters.vue';
import Layout from './Layout.vue';
import TableConfig from './TableConfig.vue';

const props = defineProps({
    data: {
        type: Object,
        required: true,
    },
});

const permanentFilters = reactive([]);

const close = () => {
    props.data.callback.reject('Close on overlay click');
};

const apply = () => {
    localStorage.setItem(
        'permanent-filters-state-' +
            props.data.rawData.pagination.config.cachePrefix,
        JSON.stringify(permanentFilters)
    );
    location.reload();
};
const confirmApply = () => {
    window.awesomeModal
        .confirm('¿Está seguro?', '¿Está seguro que desea aplicar los filtros?')
        .then((result) => {
            if (result) {
                apply();
            }
        });
};
</script>

<style lang="scss" scoped>
.modal {
    background-color: #ffffff;
    padding: 0;
    // min-height: calc(100% - 30px);
    margin-top: 15px;
    margin-bottom: 15px;

    max-height: calc(100vh - 30px);
    overflow: auto;

    height: 100%;
    min-height: 300px;
    width: calc(100vw - 60px);
    // max-width: 860px;

    display: flex;
    flex-direction: column;
    overflow: hidden;
    &__header {
        padding: 30px 24px 20px 24px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    &__close {
        cursor: pointer;
        font-size: 25px;
        transition: all 0.3s ease;
        color: #656565;
        &:hover {
            color: #000;
        }
    }
    &__body {
        padding: 0 24px 42px 24px;
        overflow: scroll;
    }
    &__buttons {
        display: flex;
        gap: 15px;
        margin-left: auto;
        align-items: center;
        justify-content: space-between;
        width: 100%;
    }
}
.modal {
    animation: loading 0.5s ease-in-out;
    @keyframes loading {
        0% {
            transform: translate(0px, 1000px) scale(0.3);
        }
        100% {
            transform: translate(0px, 0px) scale(1);
        }
    }
}
.item {
    &__label {
        font-weight: 400;
        font-size: 16px;
        line-height: 19px;
        color: #919191;
        margin-bottom: 7.5px;
    }
    &__value {
        font-weight: 500;
        font-size: 16px;
        line-height: 19px;
        color: #0c0c0c;
    }
}
</style>
