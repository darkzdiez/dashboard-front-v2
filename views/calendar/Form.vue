<template>
    <h3>Articulo:</h3>
    <div class="grid-2 gap-15">
        <InputText
            label="Código Asis"
            placeholder=""
            v-model="form.codigo_asis"
            :error="errors.codigo_asis"
            class="col-1"
        />
        <InputText
            label="Código SIA"
            placeholder=""
            v-model="form.codigo_sia"
            :error="errors.codigo_sia"
            class="col-1"
        />
    </div>
</template>

<script setup>
const props = defineProps({
    form: {
        type: Object,
        required: true,
    },
    errors: {
        type: Object,
        required: true,
    },
});
</script>

<style lang="scss" scoped></style>
