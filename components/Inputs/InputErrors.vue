<template>
    <ul v-if="errors.length > 0" class="input-errors">
        <li v-for="error in errors" :key="error" v-html="error"></li>
    </ul>
</template>

<script setup>
defineProps({
    errors: {
        type: Array,
        required: false,
    },
});
</script>

<style lang="scss" scoped>
.input-errors {
    color: #ff0000;
    font-weight: 400;
    line-height: 110%;
    opacity: 1;
    font-size: 11px;
    padding: 0;
    list-style-type: decimal;
    display: flex;
    gap: 2px;
    flex-direction: column;
    margin: 2px 0 0 0;
    list-style-position: inside;
}
</style>
