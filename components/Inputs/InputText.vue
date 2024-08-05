<template>
    <label class="input col-1" :class="{ 'input--error': error.length }">
        <span v-if="label">{{ label }}</span>
        <div
            style="
                display: flex;
                justify-content: center;
                align-items: stretch;
            "
            :class="{
                'input-password': type === 'password'
            }"
        >
            <input
                :type="typeInput"
                :placeholder="placeholder"
                :value="modelValue"
                :required="false"
                :disabled="disabled"
                autocomplete="off"
                v-on:change="$emit('change', $event.target.value)"
                :min="min"
                :max="max"
                :step="step"
                @input="$emit('update:modelValue', $event.target.value)"
                :list="list"
            >
            <button
                type="button"
                v-if="type === 'password'"
                @click.prevent="toggleType"
                style="
                    border: 1px solid #C4C4C4;
                    background: transparent;
                    border-left: none;
                    padding: 0;
                    width: 55px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                "
            >
                <i class="fas fa-eye" v-if="typeInput === 'password'"></i>
                <i class="fas fa-eye-slash" v-else></i>
            </button>
        </div>
        <!--
            v-on:keypress="$emit('keypress', $event.target.value)"
            v-on:keyup="$emit('keyup', $event.target.value)"
            // tambien deberia hacer uno que diga anyEvents asi cualquiera los dispara a todos
        -->
        <InputErrors :errors="error" />
    </label>
</template>

<script setup>
    import { reactive, ref } from 'vue'

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
        disabled: {
            type: Boolean,
            required: false,
            default: false
        },
        error: {
            type: Array,
            required: false,
        },
        type: {
            type: String,
            required: false,
            default: 'text'
        },
        list: {
            type: String,
            required: false
        },
        min: {
            required: false,
            default: null
        },
        max: {
            required: false,
            default: null
        },
        step: {
            required: false,
            default: null
        },
    })
    defineEmits(['update:modelValue', 'change'])

    const typeInput = ref(null)
    if ( props.type === 'password' ) {
        typeInput.value = 'text'
        setTimeout(() => {
            typeInput.value = 'password'
        }, 1000);
    } else {
        typeInput.value = props.type
    }

    const toggleType = () => {
        if ( typeInput.value === 'password' ) {
            typeInput.value = 'text'
        } else {
            typeInput.value = 'password'
        }
    }
</script>

<style lang="scss" scoped>
	label[class*="input"] {
        display: block;
        span {
            font-weight: 500;
            line-height: 19px;
            color: #9A9A9A;
            font-size: 13px;
            margin-bottom: 9px;
            display: block;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            &:hover {
                overflow: unset;
            }
        }
        input {
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
				opacity: 1;
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
        .input-password {            
            input {
                border-right: none;
                border-radius: 4px 0 0 4px;
            }
            button {
                border-radius: 0 4px 4px 0;
            }
        }
    }
</style>
