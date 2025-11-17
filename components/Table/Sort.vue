<template>
    <div class="columns">
        <div class="columns__body">
            <div class="columns__content" ref="divColumns">
                <div
                    class="grid-2 gap-15 mb-15"
                    v-for="(permanentFilter, index) in permanentSort"
                    :key="index"
                >
                    <div class="col-1 d-flex align-items-end gap-15">
                        <button
                            class="btn btn--gray"
                            @click="permanentSort.splice(index, 1)"
                        >
                            <i class="fas fa-trash"></i>
                        </button>
                        <InputSelect
                            label="Columna"
                            v-model="permanentFilter.column"
                            :error="[]"
                            :options="columns"
                            class="flex-grow-1"
                        >
                            <template #option="{ name, label }">
                                <option :value="name">
                                    {{ label }}
                                </option>
                            </template>
                        </InputSelect>
                    </div>
                    <InputSelect
                        label="Operador Comparación"
                        v-model="permanentFilter.order"
                        :error="[]"
                        :options="[
                            { order: 'asc', descripcion: 'Ascendente' },
                            { order: 'desc', descripcion: 'Descendente' },
                        ]"
                        class="col-1"
                    >
                        <template #option="{ order, descripcion }">
                            <option :value="order">
                                {{ descripcion }}
                            </option>
                        </template>
                    </InputSelect>
                </div>
                <button
                    class="btn btn--rounded btn--lightblue"
                    type="button"
                    @click.prevent="addFilter"
                >
                    <i class="fas fa-plus"></i>
                    Añadir campo
                </button>
            </div>
        </div>
    </div>
    <div class="modal__buttons col-2 mt-15">
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
            @click.prevent="resetPermanentSort"
        >
            <i class="fas fa-undo"></i>
            Restablecer orden
        </button>
        <button
            class="btn btn--rounded btn--green"
            type="button"
            @click.prevent="applyPermanentSort"
        >
            <i class="fas fa-check"></i>
            Aplicar Filtros
        </button>
    </div>
</template>
<script setup>
import Sortable from 'sortablejs';
import { onMounted, reactive, ref } from 'vue';

const props = defineProps({
    columns: {
        type: Array,
        required: true,
    },
    close: {
        type: Function,
        required: true,
    },
});

const divColumns = ref(null);
const permanentSort = reactive([]);

const addFilter = () => {
    permanentSort.push({
        column: '',
        order: '',
    });
};

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

const applyPermanentSort = () => {
    window.awesomeModal
        .confirm('¿Está seguro?', '¿Está seguro que desea aplicar el orden?')
        .then((result) => {
            if (result) {
                localStorage.setItem(
                    'permanent-sort-state-pedido',
                    JSON.stringify(permanentSort)
                );
                location.reload();
            }
        });
};

const resetPermanentSort = () => {
    window.awesomeModal
        .confirm(
            '¿Está seguro?',
            '¿Está seguro que desea restaurar las columnas predeterminadas?'
        )
        .then((result) => {
            if (result) {
                localStorage.removeItem('permanent-sort-state-pedido');
                location.reload();
            }
        });
};

const loadPermanentSort = () => {
    const permanentSortState = JSON.parse(
        localStorage.getItem('permanent-sort-state-pedido')
    );
    if (permanentSortState) {
        permanentSortState.forEach((permanentFilter) => {
            permanentSort.push(permanentFilter);
        });
    }
};
loadPermanentSort();
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
        justify-content: space-between;
        border: 1px dashed #8f8f8f;
        padding: 8px 15px;
        width: 100%;
        user-select: none;
        cursor: move;
        align-items: center;
        box-sizing: border-box;
        background-color: #dfdfdf;
    }
    &__item--swap {
        border: 1px dashed #8f8f8f;
        background-color: #fffd8c;
    }
    &__title {
        font-size: 0.8rem;
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
