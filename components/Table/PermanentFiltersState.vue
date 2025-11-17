<template>
    <div class="permanent-filters">
        <div
            v-for="(filter, index) in permanentFilters"
            :key="index"
            class="permanent-filter"
        >
            <span>{{ filter.column }}</span>
            <span>{{ filter.operator }}</span>
            <span>{{ filter.value }}</span>
            <button @click="removeFilter(index)">
                <i class="fas fa-times"></i>
            </button>
        </div>
    </div>
</template>

<script setup>
import { reactive } from 'vue';

const props = defineProps({
    columns: {
        type: Array,
        required: true,
    },
    pagination: {
        type: Object,
        required: true,
    },
});

const permanentFilters = reactive([]);

const loadPermanentFilters = () => {
    permanentFilters.splice(0, permanentFilters.length);
    let permanentFiltersState = JSON.parse(
        localStorage.getItem(
            'permanent-filters-state-' + props.pagination.config.cachePrefix
        )
    );
    if (permanentFiltersState) {
        permanentFiltersState.forEach((permanentFilter) => {
            permanentFilters.push(permanentFilter);
        });
    }
};
loadPermanentFilters();

const removeFilter = (index) => {
    // primeramente preguntamos si el usuario está seguro de eliminar el filtro
    window.awesomeModal
        .confirm('¿Está seguro?', '¿Está seguro que desea eliminar el filtro?')
        .then((result) => {
            if (result) {
                // eliminamos el filtro
                removeFilterFromPermanentFilters(index);
            }
        });
};

const removeFilterFromPermanentFilters = (index) => {
    permanentFilters.splice(index, 1);
    localStorage.setItem(
        'permanent-filters-state-' + props.pagination.config.cachePrefix,
        JSON.stringify(permanentFilters)
    );
    props.pagination.applyFilters();
};
</script>
<style lang="scss" scoped>
.permanent-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 10px;
}

.permanent-filter {
    display: flex;
    gap: 5px;
    padding: 5px 5px 5px 10px;
    border: 1px solid #ccc;
    border-radius: 100px;
    font-size: 12px;
}

.permanent-filter button {
    background: none;
    border: none;
    cursor: pointer;
}
</style>
