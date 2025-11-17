<template>
    <div class="d-flex align-items-end gap-15">
        <InputSelect
            label="Vista"
            v-model="table_view_uuid"
            :error="[]"
            :options="table_views"
            class="flex-grow-1"
            style="max-width: 185px"
        >
            <template #option="{ uuid, table_view_name }">
                <option :value="uuid">
                    {{ table_view_name }}
                </option>
            </template>
        </InputSelect>
        <button class="btn btn--rounded btn--primary-outline" @click="save">
            Guardar
        </button>
        <button class="btn btn--rounded btn--primary-outline" @click="saveAs">
            Guardar como...
        </button>
    </div>
</template>
<script setup>
import { reactive, ref } from 'vue';
import ModalTableSaveAs from './ModalTableSaveAs.vue';

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
    apply: {
        type: Function,
        required: true,
    },
    pagination: {
        type: Object,
        required: true,
    },
});

const table_view_uuid = ref(null);
const table_views = window.tableViews;

const sendTableConfig = (
    form_table_view_uuid,
    form_table_view_name,
    form_permanentFilters
) => {
    let modal = awesomeModal.loading();
    const tableLayoutPedido = localStorage.getItem(
        'table-layout-' + props.pagination.config.cachePrefix
    );

    var form_data = new FormData();

    form_data.append('table_name', props.pagination.config.cachePrefix);
    form_data.append('table_view_uuid', form_table_view_uuid);
    form_data.append('table_view_name', form_table_view_name);
    form_data.append('table_layout', tableLayoutPedido);
    form_data.append('permanent_filters', form_permanentFilters);
    httpRequest({
        url: '/api/table-config',
        method: 'POST',
        data: form_data,
    })
        .then((response) => {
            window.getTableViews().then(() => {
                table_view_uuid.value = response.uuid;
                modal.close();
                props.apply();
            });
        })
        .catch((error) => {
            console.log(error);
            // modal.close()
        });
};

const saveAs = () => {
    let modal = awesomeModal.open({
        type: 'component',
        component: ModalTableSaveAs,
    });
    modal.promise.then((result) => {
        if (result) {
            sendTableConfig(
                result.table_view_uuid,
                result.table_view_name,
                JSON.stringify(props.permanentFilters)
            );
        }
    });
    modal.promise.catch((error) => {
        console.log('Error on save as');
    });
};

const save = () => {
    window.awesomeModal
        .confirm('¿Está seguro?', '¿Está seguro que desea guardar los cambios?')
        .then((result) => {
            if (result) {
                let name = window.tableViews.find(
                    (table_view) => table_view.uuid === table_view_uuid.value
                ).table_view_name;
                sendTableConfig(
                    table_view_uuid.value,
                    name,
                    JSON.stringify(props.permanentFilters)
                );
            }
        });
};
</script>

<style lang="scss" scoped></style>
