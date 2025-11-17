<template>
    <div class="columns">
        <div class="columns__body">
            <div class="columns__content">
                <div class="grid-3 align-items-center gap-15 mb-15">
                    <div class="col-1 d-flex align-items-end gap-15">
                        <InputSelect
                            label="Columna"
                            v-model="column"
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
                        label="From"
                        v-model="from"
                        :error="[]"
                        :options="
                            columns.find((c) => c.name === column)?.options
                        "
                        class="col-1"
                        v-if="
                            columns.find((c) => c.name === column)?.type ===
                            'select'
                        "
                        :key="column"
                    >
                        <template #option="{ value, label }">
                            <option :value="value">
                                {{ label }}
                            </option>
                        </template>
                    </InputSelect>
                    <SelectAutocomplete
                        label="From"
                        v-model="from"
                        :endpoint="
                            columns.find((c) => c.name === column)?.endpoint
                        "
                        :error="[]"
                        class="col-1"
                        option-key="id"
                        v-if="
                            columns.find((c) => c.name === column)?.type ===
                            'SelectAutocomplete'
                        "
                        :openIntoModal="true"
                        :multiple="operator === 'in' || operator === 'not_in'"
                        :key="column"
                    >
                        <template #option="option">
                            <div>
                                {{
                                    columns
                                        .find((c) => c.name === column)
                                        ?.selectOptionText(option)
                                }}
                            </div>
                        </template>
                    </SelectAutocomplete>
                    <InputText
                        label="From"
                        v-model="from"
                        :error="[]"
                        class="col-1"
                        :type="columns.find((c) => c.name === column)?.type"
                        :key="column"
                        v-else
                    />
                    <InputSelect
                        label="To"
                        v-model="to"
                        :error="[]"
                        :options="
                            columns.find((c) => c.name === column)?.options
                        "
                        class="col-1"
                        v-if="
                            columns.find((c) => c.name === column)?.type ===
                            'select'
                        "
                        :key="column"
                    >
                        <template #option="{ value, label }">
                            <option :value="value">
                                {{ label }}
                            </option>
                        </template>
                    </InputSelect>
                    <SelectAutocomplete
                        label="To"
                        v-model="to"
                        :endpoint="
                            columns.find((c) => c.name === column)?.endpoint
                        "
                        :error="[]"
                        class="col-1"
                        option-key="id"
                        v-if="
                            columns.find((c) => c.name === column)?.type ===
                            'SelectAutocomplete'
                        "
                        :openIntoModal="true"
                        :multiple="operator === 'in' || operator === 'not_in'"
                        :key="column"
                    >
                        <template #option="option">
                            <div>
                                {{
                                    columns
                                        .find((c) => c.name === column)
                                        ?.selectOptionText(option)
                                }}
                            </div>
                        </template>
                    </SelectAutocomplete>
                    <InputText
                        label="To"
                        v-model="to"
                        :error="[]"
                        class="col-1"
                        :type="columns.find((c) => c.name === column)?.type"
                        :key="column"
                        v-else
                    />
                </div>
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
            @click.prevent="resetForm"
        >
            <i class="fas fa-undo"></i>
            Restablecer
        </button>
        <button
            class="btn btn--rounded btn--green"
            type="button"
            @click.prevent="sendForm"
        >
            <i class="fas fa-check"></i>
            Enviar Actualización
        </button>
    </div>
</template>
<script setup>
import { ref } from 'vue';

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

const column = ref(null);
const from = ref(null);
const to = ref(null);

const onSubmit = () => {
    let modal = awesomeModal.loading();
    var form_data = new FormData();

    form_data.append('column', column.value);
    form_data.append('from', from.value);
    form_data.append('to', to.value);

    httpRequest({
        url: window.public_path + '/api/pedido/multiple-update',
        method: 'POST',
        data: form_data,
        errors: [],
    })
        .then((data) => {
            modal.close();
            window.location.reload();
            // router.push('/pedido')
        })
        .catch((error) => {
            modal.close();
        });
};

const sendForm = () => {
    window.awesomeModal
        .confirm(
            '¡Cuidado!, ¿Está seguro?',
            '¿Está seguro que desea actualizar en lote los datos de los pedidos?'
        )
        .then((result) => {
            if (result) {
                onSubmit();
            }
        });
};

const resetForm = () => {
    column.value = null;
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
