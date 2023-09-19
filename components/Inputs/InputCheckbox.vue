<script setup>
import { ref, reactive } from "@vue/reactivity";
import { watch } from "@vue/runtime-core";

const props = defineProps({
    label: {
        type: String,
        required: true,
    },
    modelValue: {
        type: [String, Number, Array],
        required: true,
    },
    error: {
        type: Array,
        required: false,
    },
    trueValue: {
        required: false,
        default: true,
    },
    falseValue: {
        required: false,
        default: false,
    },
    trueText: {
        type: String,
        required: false,
    },
    falseText: {
        type: String,
        required: false,
    },
    layout: {
        type: String,
        required: false,
        default: 'default', // default | input
    },
})
// watch changes in the modelValue prop deep true
// const modelValue = ref(props.modelValue)

const emit = defineEmits(['update:modelValue'])
const typeIsArray = ref(Object.prototype.toString.call(props.modelValue) == '[object Array]')

const handleChange = () => {
    // Si el tipo es array
    if (typeIsArray.value) {
        // Si el valor ya existe en el array
        if (props.modelValue.includes(props.trueValue)) {
            // Eliminar el valor del array
            emit('update:modelValue', props.modelValue.filter((value) => value != props.trueValue))
        } else {
            // Agregar el valor al array
            emit('update:modelValue', [...props.modelValue, props.trueValue])
        }
    } else {
        // Si el tipo no es array
        // Si el valor es igual al trueValue
        if (props.modelValue == props.trueValue) {
            // Asignar el falseValue
            emit('update:modelValue', props.falseValue)
        } else {
            // Asignar el trueValue
            emit('update:modelValue', props.trueValue)
        }
    }
}
/*
if ( typeIsArray ) {
    watch(() => modelValue.value, (value) => {
        emit('update:modelValue', value)
    }, { deep: true })
} else {
    watch(() => modelValue.value, (value) => {
        emit('update:modelValue', value)
    })
}

watch(() => props.modelValue, (value) => {
    // emit('update:modelValue', value)
}, { deep: true })

watch(() => modelValue.value, (value) => {
    emit('update:modelValue', value)
}, { deep: true })

/*
const emit = defineEmits(['update:modelValue'])

const state = reactive({
    checked: props.modelValue.includes(props.value),
    value: props.value
})

const handleChange = (e) => {
    if (e.target.checked) {
        state.checked = true
        emit('update:modelValue', [...props.modelValue, state.value])
    } else {
        state.checked = false
        emit('update:modelValue', props.modelValue.filter(item => item !== state.value))
    }
}
*/
</script>
<template>
    <div v-bind="$attrs">
        <label class="checkbox" @click="handleChange" v-if="props.layout == 'default'">
            <!--
                Se separa el caso de que el modelValue sea un array, ya que en ese caso
                se debe agregar o quitar el valor del checkbox al array, en caso contrario
                se debe asignar el valor del checkbox al modelValue.
            -->
            <i class="fas fa-toggle-off" v-if="typeIsArray && !modelValue.includes(trueValue)"></i>
            <i class="fas fa-toggle-off" v-else-if="!typeIsArray && modelValue != trueValue"></i>
            <i class="fas fa-toggle-on"  v-else></i>
            <span>{{ label }}</span>
        </label>
        <label class="input col-1" @click="handleChange" v-if="props.layout == 'input'" :class="{ 'input--error': error.length }">
            <span>{{ label }}</span>
            <div class="input-text checkbox-layout-input input-text--borderless">
                <i class="fas fa-toggle-off" v-if="typeIsArray && !modelValue.includes(trueValue)"></i>
                <i class="fas fa-toggle-off" v-else-if="!typeIsArray && modelValue != trueValue"></i>
                <i class="fas fa-toggle-on"  v-else></i>
                <div v-if="typeIsArray && !modelValue.includes(trueValue)">{{ falseText }}</div>
                <div v-else-if="!typeIsArray && modelValue != trueValue">{{ falseText }}</div>
                <div v-else>{{ trueText }}</div>
            </div>
            <ul v-if="error.length > 0" class="input__errors">
                <li v-for="error in error" :key="error" v-html="error"></li>
            </ul>
        </label>
    </div>
</template>

<style lang="scss" scoped>
    .checkbox {
        display: flex;
        border: 1px solid #C4C4C4;
        user-select: none;
        span {
            font-weight: 500;
            line-height: 19px;
            color: #9A9A9A;
            font-size: 14px;
            background-color: #fff;
            margin: 0;
            flex-grow: 1;
            display: flex;
            align-items: center;
            padding: 7.5px;
        }
        input {
            display: none;
        }
    }
    i {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 7.5px;
        background-color: #ededed;
        &.fa-toggle-on {
            color: var(--green);
        }
        &.fa-toggle-off {
            color: #C4C4C4;
        }
    }
    .checkbox-layout-input {
        display: flex;
        gap: 15px;
        justify-content: flex-start;
        align-items: center;
        i {
            background-color: transparent;
            font-size: 25px;
            padding: 0;
        }
    }
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
        input, .input-text {
            width: 100%;
            height: 48px;
            border: 1px solid #C4C4C4;
            border-radius: 4px;
            padding: 0 15px;
            box-sizing: border-box;
            background-color: #FFF;
            justify-content: flex-start;
            display: flex;
            align-items: center;
            user-select: none;
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
            &--borderless {
                border: none;
                padding: 0;
            }
        }
        .input__errors {
            color: #FF0000;
            font-weight: 400;
            line-height: 130%;
            opacity: 1;
            margin: 0;
            padding: 3px 0 3px 20px;
            font-size: 14px;
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