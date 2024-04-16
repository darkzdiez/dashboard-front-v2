<template>
    <div ref="rootElement" class="rootElement">
        <span v-if="label">{{ label }}</span>
        <div class="select-autocomplete">
            <button
                class="select-autocomplete__button"
                @click="click"
                type="button"
                :class="{'select-autocomplete__button--multiple': multiple}"
            >
                <div v-if="multiple" class="select-autocomplete__multiple">
                    <span v-for="(item, index) in state.selected" class="select-autocomplete__multiple-item">
                        <button
                            type="button"
                            class="select-autocomplete__multiple-remove"
                            @click.stop.prevent="state.remove(item)"
                        >
                            <i class="fas fa-times"></i>
                        </button>
                        <slot v-bind="item" name="option"></slot>
                    </span>
                </div>
                <span class="select-autocomplete__text" v-else-if="state.selected">
                    <slot v-bind="state.selected" name="option"></slot>
                </span>
                <span class="select-autocomplete__text" v-else>Seleccionar</span>
                <i class="fas fa-angle-down" style="margin-left: auto;"></i>
            </button>
            <template v-if="displayOptions">
                <Dropdown
                    :paginator="paginator"
                    :state="state"
                    :itemConditional="itemConditional"
                    :allowNull="allowNull"
                >
                    <template #option="option">
                        <slot v-bind="option" name="option"></slot>
                    </template>
                </Dropdown>
            </template>
        </div>
        <InputErrors :errors="error" />
    </div>
</template>

<script setup>
import { reactive, ref, watch, onMounted, useSlots } from 'vue'
import Dropdown from './dropdown.vue'
import ModalOptions from './modal.vue'
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
        type: [Object, String, Number, Boolean, Array],
        required: true,
    },
    error: {
        type: Array,
        required: false,
    },
    options: {
        type: Array,
        required: false,
    },
    endpoint: {
        type: String,
        required: false,
    },
    optionKey: {
        type: String,
        required: false,
        default: null,
    },
    selectedRaw: {
        type: Object,
        required: false,
        default: null,
    },
    allowNull: {
        type: Boolean,
        required: false,
        default: true,
    },
    chainedTo: {
        type: [Object, String, Number, Boolean, Array],
        required: false,
        default: null,
    },
    itemConditional: {
        type: [ Function ],
        required: false,
        default: null,
    },
    additionalContext: {
        type: Object,
        required: false,
        default: () => ({}),
    },
    openIntoModal: {
        type: Boolean,
        required: false,
        default: false,
    },
    multiple: {
        type: Boolean,
        required: false,
        default: false,
    },
})

const slots = useSlots()
window.SelectAutocomplete = {
    slots: slots
}

const emit = defineEmits(['update:modelValue'])

const displayOptions = ref(false)
const paginator = reactive({
    data: []
})

const rootElement = ref(null)
const state = reactive({
    state: 'ready',
    options: [],
    selected: null,
    search: '',
    optionKey: props.optionKey,
    selectedRaw: props.selectedRaw,
    select: function (option) {
        // console.clear()
        if (this.optionKey == null) {
            /*
            console.table({
                key: this.optionKey,
                value: option
            });
            */
        } else {
            /*
            console.table({
                key: this.optionKey,
                value: option[this.optionKey]
            });
            */
        }
        if (this.selectedRaw) {
            Object.assign(this.selectedRaw, option)
        }
        // emit('update:selectedRaw', option)
        // console.log(option)
        window.preventScrollWithArrow = false;
        displayOptions.value = false;
        if ( option != null ) {
            if ( !props.multiple ) {
                this.selected = option;
                emit('update:modelValue', option[this.optionKey])
                return
            }
            if ( Object.prototype.toString.call(this.selected) != '[object Array]' ) { // si no existe el array, lo creo
                this.selected = []
            }
            if (
                this.selected.find((item) => item[this.optionKey] == option[this.optionKey])
            ) { // si existe, lo elimino
                this.selected = this.selected.filter((item) => item[this.optionKey] != option[this.optionKey])
                props.modelValue.splice(props.modelValue.indexOf(option[this.optionKey]), 1)
            } else {
                this.selected.push(option)
                // si props.modelValue es un array, lo agrego
                if ( Object.prototype.toString.call(props.modelValue) == '[object Array]' ) {
                    props.modelValue.push(option[this.optionKey])
                } else {
                    // si props.modelValue no es un array, lo reemplazo
                    emit('update:modelValue', [option[this.optionKey]])
                }
            }
        } else {
            this.selected = null;
            emit('update:modelValue', null)
        }
        console.log(this.selected)
        // this.$forceUpdate();
    },
    remove: function (option) {
        // detecto la posicion del elemento
        let index = this.selected.indexOf(option)
        // elimino el elemento
        this.selected.splice(index, 1)
        props.modelValue.splice(index, 1)
    },
    submit: (e) => {
        e.preventDefault()
        e.stopPropagation();
        if ( !props.endpoint && props.options ) {
            filterOptions()
            return
        }
        syncData()
    }
})
document.addEventListener('click', (e) => {
    // console.log(e.target, this.$el)
    // this.$el ya no se puede utilizar en vue 3 en su lugar
    // se debe utilizar ref
    if (rootElement.value && rootElement.value.contains(e.target)) {
        return;
    }
    displayOptions.value = false;
});
// this.state = 'ready'
window.addEventListener('keydown', (e) => {
    // console.log(e.which, e.code, e.key);
    if ( ["Escape"].includes( e.code ) ) {
        displayOptions.value = false;
        window.preventScrollWithArrow = displayOptions.value
        // this.$forceUpdate();
    }
}, false)

const filterOptions = () => {
    if ( !props.options ) {
        return
    }
    if ( !props.options.length ) {
        return
    }
    // filtrar el array de options con el valor de state.search y asignarlo a paginator.data
    let filtered = props.options.filter((option) => {
        let found = false
        Object.keys(option).forEach((key) => {
            if ( Object.prototype.toString.call(option[key]) == '[object String]' ) {
                if ( option[key].toLowerCase().includes(state.search.toLowerCase()) ) {
                    found = true
                }
            }
        })
        return found
    })
    // limpiar paginator.data
    paginator.data.splice(0, paginator.data.length)
    // asignar filtered a paginator.data
    paginator.data.push(...filtered)
}

const syncData = () => {
    // let modal = awesomeModal.loading()
    if ( !props.endpoint && props.options.length ) {
        paginator.data.push(...props.options)
        return
    }
    if ( !props.endpoint ) {
        console.error('No se ha definido el endpoint')
        return
    }
    let url = new URL(window.public_path + props.endpoint)
    const form = new FormData()
    form.append('search', state.search)
    /*
    for (const [key, value] of Object.entries(appliedFilters)) {
        if (value) {
            form.append('filters[' + key + ']', value)
        }
    }
    */
    // fetch using method POST

    fetch(url, {
        method: 'POST',
        body: form,
    })
    .then(response => response.json())
    .then(data => {
        // console.clear()
        // console.log('aqui vamos')
        // chequear si es un array
        if (
            Object.prototype.toString.call(data) == '[object Array]'
        ) {
            // console.log('es un array')
            paginator.data = data
        }

        // chequear si es un objeto y no un array y si existe el metodo data.data data.next_page_url
        if (
            Object.prototype.toString.call(data) == '[object Object]'
            && data.hasOwnProperty('data')
            && data.hasOwnProperty('next_page_url')
        ) {
            // console.log('es un objeto')
            Object.assign(paginator, data)
        }
        find(props.modelValue)
        // modal.close()
    })
    .catch(error => {
        // console.clear()
        // console.log('Aqui ocurrio un error')
        // console.log(error)
        // modal.close()
        // Código de estado: 401 Unauthorized
        if (error.response.status == 401) {
            console.log('acceso denegado')
            router.push('/login')
            return false
        }
        // Código de estado: 422 Unprocessable Content
        if (error.response.status == 422) {
            Object.assign(errors, error.response.data.errors)
            return false
        }
    })
}
const refreshData = () => {
    syncData()
}
syncData()

const click = () => {
    if (!props.openIntoModal) {
        displayOptions.value = !displayOptions.value;
        window.preventScrollWithArrow = displayOptions.value
        if (displayOptions.value) {
            setTimeout(() => {
                state.inputSearch.focus();
            }, 200);
        } else {
        }
    } else {
        // console.clear()
        // console.log(ModalOptions)
        awesomeModal.open({
            type: 'component',
            component: ModalOptions,
            paginator: paginator,
            state: state,
            itemConditional: props.itemConditional,
            allowNull: props.allowNull,
            slots:slots
        })
    }
}



const find = (optionKey) => {
    console.log('find')
    if ( Object.prototype.toString.call(optionKey) === '[object Array]' ) { // si es un array
        let selected = []
        optionKey.forEach((item) => {
            paginator.data.find((option) => {
                if (option[props.optionKey] == item) {
                    selected.push(option)
                    return true
                }
            })
        })
        console.log(state.selected, selected)
        if ( Object.prototype.toString.call(state.selected) === '[object Array]' ) {
            Object.assign(state.selected, selected)
        } else {
            state.selected = selected
        }
    } else {
        paginator.data.find((option) => {
            if (option[props.optionKey] == optionKey) {
                state.select(option)
                return true
            }
        })
    }
    /*
    let url = new URL(window.public_path + props.endpoint)
    const form = new FormData()
    form.append('optionKey', optionKey)

    fetch(url, {
        method: 'POST',
        body: form,
    })
    .then(response => response.json())
    .then(data => {
        state.selected = data
        // modal.close()
    })
    .catch(error => {
        // modal.close()
        // Código de estado: 401 Unauthorized
        if (error.response.status == 401) {
            console.log('acceso denegado')
            router.push('/login')
            return false
        }
        // Código de estado: 422 Unprocessable Content
        if (error.response.status == 422) {
            Object.assign(errors, error.response.data.errors)
            return false
        }
    })
    */
}
onMounted(() => {
    console.log('onMounted')
    if (props.modelValue) {
        console.log('onMounted')
        console.log(props.modelValue)
        find(props.modelValue)
    }
})

watch(() => props.modelValue, (value) => {
    find(value)
})

// si chainedTo cambia, se debe limpiar state.search
// y ejecutar syncData()
watch(() => props.chainedTo, (value) => {
    console.log('chainedTo')
    state.search = ''
    syncData()
})

</script>



<style lang="scss" scoped>
    .rootElement {
        &>span {
            font-weight: 500;
            line-height: 19px;
            color: #9A9A9A;
            font-size: 14px;
            margin-bottom: 9px;
            display: block;
        }
    }
    .select-autocomplete {
        position: relative;
        //z-index: 1;
        width: 100%;
        max-width: 100%;
        &__text {
            white-space: nowrap;
            overflow: hidden;
            max-width: calc(100% - 50px);
            // position: absolute;
            text-overflow: ellipsis;
        }
        &__button {
            background: #FFFFFF;
            border: 1px solid #C1C1C1;
            border-radius: 4px;
            width: 100%;
            height: 48px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 20px;
            &--multiple {
                height: auto;
                min-height: 48px;
                padding: 5px 20px;
            }
        }
        &__multiple {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 5px;
            &-item {
                background-color: #F2F2F2;
                border-radius: 4px;
                display: flex;
                align-items: center;
                border: 1px solid #9d9d9d;
                box-sizing: border-box;
                padding-right: 5px;
            }
            &-remove {
                border: none;
                border-right: 1px solid #9d9d9d;
                padding: 5px 9px;
                cursor: pointer;
                margin-right: 5px;
            }
        }
    }
</style>