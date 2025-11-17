<template>
    <div class="columns">
        <div class="columns__body">
            <div class="columns__content" ref="divColumns">
                <div
                    class="grid-3 align-items-center gap-15 mb-15"
                    v-for="(permanentFilter, index) in permanentFilters"
                    :key="
                        columns.find(
                            (column) => column.name === permanentFilter.column
                        )?.name + index
                    "
                >
                    <div class="col-1 d-flex align-items-end gap-15">
                        <button
                            class="btn btn--gray"
                            @click="permanentFilters.splice(index, 1)"
                        >
                            <i class="fas fa-trash"></i>
                        </button>
                        <InputSelect
                            label="Columna"
                            v-model="permanentFilter.column"
                            :error="[]"
                            :options="
                                columns.filter((column) => column.searchable)
                            "
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
                        v-model="permanentFilter.operator"
                        :error="[]"
                        :options="operators(permanentFilter)"
                        class="col-1"
                    >
                        <template #option="{ operador, descripcion }">
                            <option :value="operador">
                                {{ descripcion }}
                            </option>
                        </template>
                    </InputSelect>
                    <template
                        v-if="
                            ![
                                'empty',
                                'not_empty',
                                'last_30_days',
                                'next_60_days',
                            ].includes(permanentFilter.operator)
                        "
                    >
                        <div
                            class="d-flex gap-15"
                            v-if="permanentFilter.operator === 'between'"
                        >
                            <InputText
                                label="Desde"
                                v-model="permanentFilter.value.split(',')[0]"
                                @input="
                                    (e) =>
                                        (permanentFilter.value = `${e.target.value},${permanentFilter.value.split(',')[1] || ''}`)
                                "
                                :error="[]"
                                class="col-1"
                                type="date"
                            />
                            <InputText
                                label="Hasta"
                                v-model="permanentFilter.value.split(',')[1]"
                                @input="
                                    (e) =>
                                        (permanentFilter.value = `${permanentFilter.value.split(',')[0] || ''},${e.target.value}`)
                                "
                                :error="[]"
                                class="col-1"
                                type="date"
                            />
                        </div>
                        <InputSelect
                            label="Valor"
                            v-model="permanentFilter.value"
                            :error="[]"
                            :options="
                                columns.find(
                                    (column) =>
                                        column.name === permanentFilter.column
                                )?.options
                            "
                            class="col-1"
                            v-else-if="
                                columns.find(
                                    (column) =>
                                        column.name === permanentFilter.column
                                )?.type === 'select'
                            "
                        >
                            <template #option="{ value, label }">
                                <option :value="value">
                                    {{ label }}
                                </option>
                            </template>
                        </InputSelect>
                        <SelectAutocomplete
                            label="Valor"
                            v-model="permanentFilter.value"
                            :endpoint="
                                columns.find(
                                    (column) =>
                                        column.name === permanentFilter.column
                                )?.endpoint || ''
                            "
                            :options="
                                columns.find(
                                    (column) =>
                                        column.name === permanentFilter.column
                                )?.options || []
                            "
                            :error="[]"
                            class="col-1"
                            option-key="value"
                            v-else-if="
                                columns.find(
                                    (column) =>
                                        column.name === permanentFilter.column
                                )?.type === 'SelectAutocomplete'
                            "
                            :openIntoModal="true"
                            :multiple="
                                permanentFilter.operator === 'in' ||
                                permanentFilter.operator === 'not_in'
                            "
                        >
                            <template #option="{ value, label }">
                                <div>
                                    {{ label }}
                                </div>
                            </template>
                        </SelectAutocomplete>
                        <InputText
                            label="Valor"
                            v-model="permanentFilter.value"
                            :error="[]"
                            class="col-1"
                            :type="
                                columns.find(
                                    (column) =>
                                        column.name === permanentFilter.column
                                )?.type
                            "
                            v-else
                        />
                    </template>
                </div>
                <div>
                    <button
                        class="btn btn--rounded btn--primary-outline"
                        type="button"
                        @click.prevent="addFilter"
                    >
                        <i class="fas fa-plus"></i>
                        Agregar Filtro
                    </button>
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
            @click.prevent="resetPermanentFilters"
        >
            <i class="fas fa-undo"></i>
            Restablecer Filtros
        </button>
        <button
            class="btn btn--rounded btn--green"
            type="button"
            @click.prevent="applyPermanentFilters"
        >
            <i class="fas fa-check"></i>
            Aplicar Filtros
        </button>
    </div>
</template>
<script setup>
import Sortable from 'sortablejs';
import { onMounted, reactive, ref, watch } from 'vue';

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
    permanentFilters: {
        type: Array,
        required: true,
        default: () => reactive([]),
    },
    pagination: {
        type: Object,
        required: true,
    },
});

watch(
    () => props.permanentFilters,
    (filters) => {
        filters.forEach((filter, index) => {
            // si filter.value es un array y no es un operador in/not_in, entonces lo convertimos a string vacío
            if (
                Array.isArray(filter.value) &&
                !['in', 'not_in'].includes(filter.operator)
            ) {
                filter.value = '';
            }
            // si filter.value no es un array y es un operador in/not_in, entonces lo asignamos a un array vacío
            if (
                !Array.isArray(filter.value) &&
                ['in', 'not_in'].includes(filter.operator)
            ) {
                filter.value = [];
            }
            // si el operador es last_30_days o next_60_days, entonces el valor es un string vacío
            if (['last_30_days', 'next_60_days'].includes(filter.operator)) {
                filter.value = '';
            }
        });
    },
    { deep: true }
);

const operators = (permanentFilter) => {
    const allOperators = [
        { operador: '>', descripcion: 'Mayor que (>)' },
        { operador: '>=', descripcion: 'Mayor o igual que (>=)' },
        { operador: '<', descripcion: 'Menor que (<)' },
        { operador: '<=', descripcion: 'Menor o igual que (<=)' },
        { operador: '=', descripcion: 'Igual que (=)' },
        { operador: '!=', descripcion: 'Diferente que (!=)' },
        { operador: 'empty', descripcion: 'Vacio' },
        { operador: 'not_empty', descripcion: 'No vacio' },
        { operador: 'in', descripcion: 'Pertenece a' },
        { operador: 'not_in', descripcion: 'No pertenece a' },
        { operador: 'between', descripcion: 'Entre' },
        { operador: 'last_30_days', descripcion: 'Últimos 30 días' },
        { operador: 'next_60_days', descripcion: 'Próximos 60 días' },
    ];
    const column = props.columns.find(
        (column) => column.name === permanentFilter.column
    );
    if (column) {
        const type = column.type;
        if (type === 'SelectAutocomplete') {
            return allOperators.filter(
                (operator) =>
                    ![
                        '>',
                        '>=',
                        '<',
                        '<=',
                        'between',
                        'last_30_days',
                        'next_60_days',
                    ].includes(operator.operador)
            );
        }
        if (type === 'select') {
            return allOperators.filter(
                (operator) =>
                    ![
                        '>',
                        '>=',
                        '<',
                        '<=',
                        'in',
                        'not_in',
                        'between',
                        'last_30_days',
                        'next_60_days',
                    ].includes(operator.operador)
            );
        }
        if (type === 'date') {
            return allOperators.filter(
                (operator) => !['in', 'not_in'].includes(operator.operador)
            );
        }
    }
    return allOperators.filter(
        (operator) =>
            ![
                'in',
                'not_in',
                'between',
                'last_30_days',
                'next_60_days',
            ].includes(operator.operador)
    );
};

const divColumns = ref(null);

const addFilter = () => {
    props.permanentFilters.push({
        column: '',
        operator: '',
        value: '',
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

const applyPermanentFilters = () => {
    window.awesomeModal
        .confirm('¿Está seguro?', '¿Está seguro que desea aplicar los filtros?')
        .then((result) => {
            if (result) {
                localStorage.setItem(
                    'permanent-filters-state-' +
                        props.pagination.config.cachePrefix,
                    JSON.stringify(props.permanentFilters)
                );
                location.reload();
            }
        });
};

const resetPermanentFilters = () => {
    window.awesomeModal
        .confirm(
            '¿Está seguro?',
            '¿Está seguro que desea restaurar las columnas predeterminadas?'
        )
        .then((result) => {
            if (result) {
                localStorage.removeItem(
                    'permanent-filters-state-' +
                        props.pagination.config.cachePrefix
                );
                location.reload();
            }
        });
};

const loadPermanentFilters = () => {
    const permanentFiltersState = JSON.parse(
        localStorage.getItem(
            'permanent-filters-state-' + props.pagination.config.cachePrefix
        )
    );
    if (permanentFiltersState) {
        permanentFiltersState.forEach((permanentFilter) => {
            props.permanentFilters.push(permanentFilter);
        });
    }
};
loadPermanentFilters();
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
