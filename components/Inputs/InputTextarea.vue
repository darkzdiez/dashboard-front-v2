<template>
    <label class="input col-1" :class="{ 'input--error': error.length }">
        <span>{{ label }}</span>
        <textarea
            :placeholder="placeholder"
            :value="modelValue"
            :required="false"
            :disabled="disabled"
            :rows="rows"
            autocomplete="off"
            @input="$emit('update:modelValue', $event.target.value)"
            :min="min"
            :max="max"
            :maxlength="max"
        ></textarea>
        <InputErrors :errors="error" />
    </label>
</template>

<script setup>
defineProps({
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
    disabled: {
        type: Boolean,
        required: false,
        default: false,
    },
    rows: {
        type: Number,
        required: false,
        default: 4,
    },
    error: {
        type: Array,
        required: false,
    },
    type: {
        type: String,
        required: false,
        default: 'text',
    },
    min: {
        required: false,
        default: null,
        type: Number,
    },
    max: {
        required: false,
        default: null,
        type: Number,
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
    textarea {
        width: 100%;
        border: 1px solid #c4c4c4;
        border-radius: 4px;
        padding: 0 15px;
        box-sizing: border-box;
        field-sizing: content;
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
    textarea {
        padding-top: 8px;
        padding-bottom: 8px;
        resize: vertical;
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
</style>
