<template>
    <button type="button" @click.prevent="openColumnsConfig">
        <slot></slot>
    </button>
</template>

<script setup>
import { reactive, watch } from 'vue';
import ModalTableConfig from './ModalTableConfig.vue';
import ModalTableFilters from './ModalTableFilters.vue';
import ModalTableLayout from './ModalTableLayout.vue';
import ModalTableMultipleUpdate from './ModalTableMultipleUpdate.vue';
import ModalTableSort from './ModalTableSort.vue';

const props = defineProps({
    columns: {
        type: Array,
        required: true,
    },
    pagination: {
        type: Object,
        required: true,
    },
    open: {
        type: String,
        required: true,
    },
});

const openColumnsConfig = () => {
    if (props.open === 'config') {
        awesomeModal.open({
            type: 'component',
            component: ModalTableConfig,
            columns: props.columns,
            pagination: props.pagination,
        });
    }
    if (props.open === 'layout') {
        awesomeModal.open({
            type: 'component',
            component: ModalTableLayout,
            columns: props.columns,
            pagination: props.pagination,
        });
    }
    if (props.open === 'filters') {
        awesomeModal.open({
            type: 'component',
            component: ModalTableFilters,
            columns: props.columns,
        });
    }
    if (props.open === 'sort') {
        awesomeModal.open({
            type: 'component',
            component: ModalTableSort,
            columns: props.columns,
        });
    }
    if (props.open === 'multiple-update') {
        awesomeModal.open({
            type: 'component',
            component: ModalTableMultipleUpdate,
            columns: props.columns,
        });
    }
};

// si columns cambiara, se bebería guardar en el local storage dos cosas:
// 1. el orden de las columnas
// 2. la visibilidad de las columnas
const columnsState = reactive({});
watch(
    props.columns,
    (newColumns) => {
        newColumns.forEach((column, index) => {
            columnsState[column.name] = {
                visible: column.visible,
                order: index,
                // filter: column.filter,
            };
        });
        localStorage.setItem(
            'table-layout-' + props.pagination.config.cachePrefix,
            JSON.stringify(columnsState)
        );
    },
    { deep: true }
);

// Si se detecta que existe en el local storage el estado de las columnas, se debe cargar
// el array debe tener el orden y la visibilidad de las columnas
const columnsStateLocalStorage = localStorage.getItem(
    'table-layout-' + props.pagination.config.cachePrefix
);
if (columnsStateLocalStorage) {
    console.log('aca entra y ordena');
    const columnsStateLocalStorageParsed = JSON.parse(columnsStateLocalStorage);
    const columnsStateLocalStorageParsedKeys = Object.keys(
        columnsStateLocalStorageParsed
    );
    columnsStateLocalStorageParsedKeys.forEach((key) => {
        const column = props.columns.find((column) => column.name === key);
        if (column) {
            column.visible = columnsStateLocalStorageParsed[key].visible;
            // column.filter = columnsStateLocalStorageParsed[key].filter
            if (columnsStateLocalStorageParsed[key].filter) {
                // esto es para que no reescriba los filtros si existentes
                props.pagination.filters[key] =
                    columnsStateLocalStorageParsed[key].filter;
            }
        }
    });
    props.columns.sort((a, b) => {
        return (
            columnsStateLocalStorageParsed[a.name]?.order -
            columnsStateLocalStorageParsed[b.name]?.order
        );
    });
}
</script>
<style lang="scss" scoped></style>
