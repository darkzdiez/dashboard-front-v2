<template>
    <th class="table__sort" @click="pagination.sortBy(orderKey)">
        <slot></slot>
        <i class="fas fa-sort" v-if="pagination.sort.column != orderKey"></i>
        <i
            class="fas fa-sort-up"
            v-if="
                pagination.sort.column == orderKey &&
                pagination.sort.order == 'asc'
            "
        ></i>
        <i
            class="fas fa-sort-down"
            v-if="
                pagination.sort.column == orderKey &&
                pagination.sort.order == 'desc'
            "
        ></i>
    </th>
</template>

<script setup>
defineProps({
    pagination: {
        required: true,
    },
    orderKey: {
        type: String,
        required: true,
    },
});
</script>

<style lang="scss" scoped></style>
