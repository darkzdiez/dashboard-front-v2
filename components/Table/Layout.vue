<template>
    <div class="columns">
        <div class="columns__body">
            <div class="columns__content" ref="divColumns">
                <div
                    class="columns__item"
                    v-for="column in columns"
                    :key="column.name"
                >
                    <div class="columns__input">
                        <input type="checkbox" v-model="column.visible" />
                    </div>
                    <div class="columns__title">
                        {{ column.label }}
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="modal__buttons col-2 mt-15" v-if="enableButtons">
        <button
            class="btn btn--rounded btn--gray"
            type="button"
            @click.prevent="close"
        >
            <i class="fas fa-times"></i>
            Cerrar
        </button>
        <button
            class="btn btn--rounded btn--lightblue"
            type="button"
            @click.prevent="restartDefaultColumns"
        >
            <i class="fas fa-undo"></i>
            Restaurar Predeterminadas
        </button>
    </div>
</template>
<script setup>
import Sortable from 'sortablejs';
import { onMounted, ref } from 'vue';

const props = defineProps({
    columns: {
        type: Array,
        required: true,
    },
    close: {
        type: Function,
        required: true,
    },
    enableButtons: {
        type: Boolean,
        default: true,
    },
    pagination: {
        type: Object,
        required: true,
    },
});

const divColumns = ref(null);

onMounted(() => {
    const sortable = Sortable.create(divColumns.value, {
        swap: true,
        swapClass: 'columns__item--swap',
        animation: 150,
        handle: '.columns__item',
        onEnd: (evt) => {
            const item = props.columns.splice(evt.oldIndex, 1)[0];
            props.columns.splice(evt.newIndex, 0, item);
        },
    });
});

const restartDefaultColumns = () => {
    window.awesomeModal
        .confirm(
            '¿Está seguro?',
            '¿Está seguro que desea restaurar las columnas predeterminadas?'
        )
        .then((result) => {
            if (result) {
                localStorage.removeItem(
                    'table-layout-' + props.pagination.config.cachePrefix
                );
                location.reload();
            }
        });
};
</script>

<style lang="scss" scoped>
.columns {
    &__body {
        overflow: auto;
    }
    &__content {
        display: flex;
        gap: 5px;
        flex-direction: column;
    }
    &__item {
        display: flex;
        justify-content: flex-start;
        border: 1px dashed #8f8f8f;
        width: 100%;
        user-select: none;
        cursor: move;
        align-items: center;
        box-sizing: border-box;
        background-color: #dfdfdf;
        gap: 8px;
        padding: 3px 10px;
    }
    &__item--swap {
        border: 1px dashed #8f8f8f;
        background-color: #fffd8c;
    }
    &__title {
        font-size: 0.75rem;
        font-weight: bold;
        text-align: center;
    }
    &__input {
        display: flex;
        justify-content: center;
        align-items: center;
        input[type='text'] {
            border: none;
            margin: 0;
            height: 30px;
            margin-right: 8px;
            padding: 0 15px;
            box-sizing: border-box;
        }
    }
}
</style>
