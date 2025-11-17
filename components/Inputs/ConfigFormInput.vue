<template>
    <div
        class="input-config-form"
        :class="classContainer"
        v-if="config[inputKey]?.permission != 'hide'"
    >
        <slot
            v-if="config[inputKey]?.permission == 'edit'"
            :class="classInput"
        ></slot>
        <InputFake
            :label="config[inputKey]?.label"
            placeholder=""
            :text="value"
            :error="[]"
            :class="classInput"
            :borderless="false"
            :disabled="true"
            :key="inputKey"
            v-if="config[inputKey]?.permission == 'show'"
        />
        <div
            v-if="config[inputKey]?.help_text"
            class="input-config-form__help-text"
        >
            <i class="fas fa-info-circle"></i>
            <span v-html="config[inputKey]?.help_text"></span>
        </div>
    </div>
</template>

<script setup>
import { reactive, ref } from 'vue';

const props = defineProps({
    label: {
        type: [String, Number],
        required: true,
    },
    config: {
        type: Object,
        required: true,
    },
    inputKey: {
        type: [String, Number],
        required: true,
    },
    value: {
        type: [String, Number],
        required: true,
    },
    classInput: {
        type: String,
        default: '',
        required: false,
    },
    classContainer: {
        type: String,
        default: '',
        required: false,
    },
});
</script>

<style lang="scss" scoped>
.input-config-form {
    position: relative;
    &__help-text {
        position: absolute;
        top: 0;
        right: 0;
        font-size: 0.75rem;
        span {
            display: none;
        }
        &:hover span {
            display: inline;
            background: #f8f9fa;
            border: 1px solid #ced4da;
            padding: 0.5rem;
            border-radius: 0.25rem;
            position: absolute;
            width: 200px;
            right: 0;
            z-index: 10;
        }
    }
}
</style>
