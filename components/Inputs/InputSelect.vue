<template>
    <label class="input col-1" :class="{ 'input--error': error.length }">
        <span v-if="label">{{ label }}</span>
        <select
            :value="modelValue"
            :required="false"
            @input="$emit('update:modelValue', $event.target.value)"
            >
            <slot v-for="option in options" v-bind="option" name="option"></slot>
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
})
defineEmits(['update:modelValue'])
</script>

<style lang="scss" scoped>
	label[class*="input"] {
        display: block;
        span {
            font-weight: 500;
            line-height: 19px;
            color: #9A9A9A;
            font-size: 14px;
            margin-bottom: 9px;
            display: block;
        }
        input, select {
            width: 100%;
            height: 48px;
            border: 1px solid #C4C4C4;
            border-radius: 4px;
            padding: 0 15px;
            box-sizing: border-box;
			&:-webkit-autofill,
			&:-webkit-autofill:hover, 
			&:-webkit-autofill:focus, 
			&:-webkit-autofill:active{
				-webkit-box-shadow: 0 0 0 30px white inset !important;
			}
			&:focus, &:valid, &:not(:placeholder-shown) {
				outline: none;
				& + span {
					top: 5px;
					font-size: 12px;
					color: #656565;
					opacity: 0.8;
				}
			}
            &:focus {
                box-shadow: 0 0 2px 1px rgba(#00a651, .5);
            }
			&::-webkit-input-placeholder {
				opacity: 0;
			}
        }
        &.input--error {
            color: #FF0000;
            input {
                border: 1px solid #FF0000;
                &:focus {
                    box-shadow: 0 0 2px 1px rgba(#FF0000, .5);
                }
            }
        }
    }
</style>