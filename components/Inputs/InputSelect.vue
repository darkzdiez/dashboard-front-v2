<template>
    <label class="input col-1" :class="{ 'input--error': error.length }">
        <span v-if="label">{{ label }}</span>
        <select
            :value="modelValue"
            :required="false"
            @input="$emit('update:modelValue', $event.target.value)"
        >
            <slot
                v-for="option in options"
                v-bind="option"
                name="option"
            ></slot>
            <slot name="raw-options"></slot>
        </select>
        <InputErrors :errors="error" />
    </label>
</template>

<script setup>
const props = defineProps({
    label: {
        type: String,
        required: true,
    },
    placeholder: {
        type: String,
        required: false,
    },
    modelValue: {
        type: String,
        required: true,
    },
    error: {
        type: Array,
        required: false,
        default: () => [],
    },
    options: {
        type: Array,
        required: false,
    },
});
defineEmits(['update:modelValue']);
</script>

<style lang="scss" scoped>
label[class*='input'] {
    display: block;
    span {
        font-weight: 500;
        line-height: 19px;
        color: #9a9a9a;
        font-size: 14px;
        margin-bottom: 6px;
        display: block;
    }
    input,
    select {
        width: 100%;
        height: 48px;
        border: 1px solid #c4c4c4;
        border-radius: 4px;
        padding: 0 15px;
        box-sizing: border-box;
        &:-webkit-autofill {
            box-shadow:
                0 0 0 30px white inset,
                0px 0px 4px 0px rgba(0, 0, 0, 0) !important;
        }
        &:-webkit-autofill:focus,
        &:-webkit-autofill:active {
            box-shadow:
                0 0 0 30px white inset,
                0px 0px 4px 0px rgba(0, 0, 0, 0.7) !important;
            border: 1px solid #2e2e2e;
        }
        &:focus,
        &:active {
            box-shadow:
                0 0 0 30px white inset,
                0px 0px 4px 0px rgba(0, 0, 0, 0.7) !important;
            border: 1px solid #2e2e2e;
        }
        &:focus,
        &:valid,
        &:not(:placeholder-shown) {
            outline: none;
            & + span {
                top: 5px;
                font-size: 14px;
                color: #656565;
                opacity: 0.8;
            }
        }
        &:focus {
            box-shadow: 0 0 2px 1px rgba(#00a651, 0.5);
        }
        &::-webkit-input-placeholder {
            opacity: 0;
        }
    }
    &.input--error {
        color: #ff0000;
        input {
            border: 1px solid #ff0000;
            &:focus {
                box-shadow: 0 0 2px 1px rgba(#ff0000, 0.5);
            }
        }
    }
}

label[class*='input--small'] {
    span {
        white-space: nowrap;
        font-size: 14px;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-bottom: 6px;
    }
    input,
    .input-text,
    select {
        height: 33px;
        overflow: hidden;
        font-size: 14px;
    }
}
</style>
