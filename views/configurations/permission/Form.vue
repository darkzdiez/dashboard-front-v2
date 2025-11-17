<template>
    <div class="grid-2 gap-15">
        <div class="d-flex col-1 align-items-end gap-10">
            <InputText
                label="Nombre/Slug"
                placeholder=""
                v-model="form.name"
                :error="errors.name"
                class="w-full flex-grow-1"
            />
            <button
                class="btn btn--darkgray"
                @click="slugifyName"
                type="button"
            >
                Generar Slug
            </button>
        </div>
        <InputText
            label="Grupo"
            placeholder=""
            v-model="form.group_prefix"
            :error="errors.group_prefix"
            class="col-1"
        />
        <InputText
            label="Guard"
            placeholder=""
            v-model="form.guard_name"
            :error="errors.guard_name"
            class="col-1"
        />
        <InputText
            label="Descripción"
            placeholder=""
            v-model="form.description"
            :error="errors.description"
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

const slugifyName = () => {
    props.form.name = props.form.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
};
</script>

<style lang="scss" scoped></style>
