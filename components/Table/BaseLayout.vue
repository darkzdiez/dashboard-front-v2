<template>
    <!-- ListableMultiSelectedta de pedidos seleccionados -->
    <div v-if="controlState.controlMode === 'multiple'" class="selected-items">
        <div
            v-for="itemSelected in controlState.tableMultiSelected"
            :key="itemSelected"
            class="selected-items__item"
        >
            <i
                class="fas fa-times"
                @click="controlState.tableMultiSelectToggle(itemSelected)"
            ></i>
            {{ itemSelected }}
        </div>
    </div>
    <div :class="{ 'table--full-height': fullHeight }">
        <table class="table--small table">
            <thead>
                <tr class="row-top-sticky">
                    <th v-if="controlState.controlMode === 'multiple'"></th>
                    <template v-for="column in columns">
                        <th
                            v-if="column.visible"
                            :key="column.name"
                            @click="
                                column.sortable
                                    ? pagination.sortBy(column.name)
                                    : null
                            "
                            class="table__sort"
                        >
                            <abbr :title="column.label">{{ column.abbr }}</abbr>
                            <template v-if="column.sortable">
                                <i
                                    class="fas fa-sort"
                                    v-if="pagination.sort.column != column.name"
                                ></i>
                                <i
                                    class="fas fa-sort-up"
                                    v-if="
                                        pagination.sort.column == column.name &&
                                        pagination.sort.order == 'asc'
                                    "
                                ></i>
                                <i
                                    class="fas fa-sort-down"
                                    v-if="
                                        pagination.sort.column == column.name &&
                                        pagination.sort.order == 'desc'
                                    "
                                ></i>
                            </template>
                        </th>
                    </template>
                    <th v-if="pagination.trash.value">Eliminado</th>
                    <th class="col-end-sticky"></th>
                </tr>
            </thead>
            <tbody>
                <tr class="table__search" v-if="displayFilters">
                    <td v-if="controlState.controlMode === 'multiple'"></td>
                    <template v-for="column in columns">
                        <td v-if="column.visible" :key="column.name">
                            <template v-if="column.searchable">
                                <input
                                    type="text"
                                    v-model="pagination.filters[column.name]"
                                    @keyup.enter="pagination.applyFilters"
                                    v-if="column.type == 'text'"
                                    placeholder="Filtrar..."
                                />
                                <select
                                    v-model="pagination.filters[column.name]"
                                    @keyup.enter="pagination.applyFilters"
                                    v-if="column.type == 'select'"
                                >
                                    <option
                                        :value="option.value"
                                        v-for="option in column.options"
                                    >
                                        {{ option.label }}
                                    </option>
                                </select>
                                <SelectAutocomplete
                                    :label="null"
                                    v-model="pagination.filters[column.name]"
                                    :endpoint="column.endpoint"
                                    :options="column.options"
                                    :error="[]"
                                    option-key="value"
                                    v-if="column.type == 'SelectAutocomplete'"
                                    class="select-filter"
                                    :multiple="column.multiple"
                                >
                                    <template #option="{ value, label }">
                                        <div>
                                            {{ label }}
                                        </div>
                                    </template>
                                </SelectAutocomplete>
                            </template>
                        </td>
                    </template>
                    <td v-if="pagination.trash.value"></td>
                    <td class="col-end-sticky">
                        <div class="btns" style="padding: 4px 5px; gap: 4px">
                            <button
                                class="btn btn--search btn--darkgray"
                                @click="pagination.applyFilters"
                            >
                                <i class="fas fa-search"></i>
                            </button>
                            <button
                                class="btn btn--search btn--gray"
                                @click="clearFilters"
                            >
                                <i class="fas fa-eraser"></i>
                            </button>
                        </div>
                    </td>
                </tr>
                <template v-for="(item, key) in pagination.paginator.data">
                    <tr>
                        <td v-if="controlState.controlMode === 'multiple'">
                            <input
                                type="checkbox"
                                :value="item.po"
                                v-model="controlState.tableMultiSelected"
                            />
                        </td>
                        <!--<td><StarFeatured :value="item.is_featured" :uuid="item.uuid" /></td>-->
                        <template v-for="column in columns">
                            <td
                                v-if="
                                    column.visible &&
                                    column.render == 'component'
                                "
                                :key="column.name"
                            >
                                <component :is="column.value(item)">
                                </component>
                            </td>
                            <td
                                v-else-if="column.visible"
                                v-html="column.value(item)"
                            ></td>
                        </template>
                        <td
                            v-if="pagination.trash.value"
                            style="white-space: nowrap; font-size: 11.5px"
                        >
                            {{ item.deleted_at_formatted }}
                        </td>
                        <slot name="itemButtons" :item="item"></slot>
                    </tr>
                    <tr v-for="i in item.items" class="subitem">
                        <td></td>
                        <td :colspan="columns.length + 1">
                            {{ i.code }} - {{ i.name }}
                        </td>
                    </tr>
                </template>
            </tbody>
        </table>
    </div>
    <Paginator
        :paginator="pagination.paginator"
        @change="pagination.syncData"
    />
</template>
<script setup>
import { defineProps, ref } from 'vue';
// import StarFeatured from './StarFeatured.vue';
const props = defineProps({
    pagination: {
        type: Object,
        required: true,
    },
    columns: {
        type: Array,
        required: true,
    },
    displayFilters: {
        type: Boolean,
        default: true,
    },
    fullHeight: {
        type: Boolean,
        default: true,
    },
    clearFilters: {},
    controlState: {
        type: Object,
        required: false,
        default: () => ({
            tableMultiSelected: [],
            controlMode: 'normal', // 'normal' or 'multiple'
        }),
    },
});

const display = ref(false);
</script>
<style lang="scss" scoped>
td:empty::after {
    content: '-';
    color: #5f5f5f;
}

.card__header {
    padding: 4px 15px;
    font-size: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.table--full-height {
    //max-height: calc(-275px + 100vh);
    overflow: auto;
    // height: calc(-275px + 100vh);
    min-height: calc(100vh - 300px);
}
</style>
<style lang="scss">
.select-filter {
    .select-autocomplete__button {
        border: none !important;
        height: 40px !important;
        padding: 0 5px 0 0 !important;
    }
    .select-autocomplete__text {
        max-width: calc(100% - 11px) !important;
    }
    .select-autocomplete__button.select-autocomplete__button--multiple {
        min-height: fit-content !important;
    }
}
.btn--search {
    width: 27px;
    height: 27px;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 10px !important;
    i {
        font-size: 10px !important;
    }
}
.row-top-sticky {
    top: -1px;
}
.col-end-sticky {
    right: 0;
}
.selected-items {
    display: flex;
    gap: 5px;
    margin-bottom: 15px;
    flex-wrap: wrap;
    &__item {
        border: 1px solid #169e0c;
        padding: 1px 6px;
        border-radius: 5px;
        font-size: 13px;
        color: #169e0c;
        white-space: nowrap;
    }
}
</style>
