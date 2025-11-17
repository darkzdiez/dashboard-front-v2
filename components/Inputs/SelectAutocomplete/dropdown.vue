<template>
    <div class="select-autocomplete__dropdown">
        <input
            type="search"
            class="select-autocomplete__search"
            v-model="state.search"
            @keyup.prevent.enter="state.submit"
            @keyup="state.submit"
            @keypress.enter.native.prevent
            placeholder="Buscar..."
            ref="inputSearch"
            @keydown.prevent.down="nextFocus"
        />
        <div class="select-autocomplete__options" v-if="state.state == 'ready'">
            <button
                class="select-autocomplete__option"
                @click="select(null)"
                @keyup.prevent.enter="select(null)"
                @keydown.prevent.down="nextFocus"
                @keydown.prevent.up="previousFocus"
                type="button"
                v-if="allowNull"
            >
                Ninguno
            </button>
            <template v-for="(option, key) in paginator.data" :key="key">
                <button
                    class="select-autocomplete__option"
                    :class="{
                        'select-autocomplete__option--selected':
                            selected(option),
                    }"
                    @click="select(option)"
                    @keyup.prevent.enter="select(option)"
                    @keydown.prevent.down="nextFocus"
                    @keydown.prevent.up="previousFocus"
                    type="button"
                    v-if="
                        typeof itemConditional == 'function'
                            ? itemConditional(option, additionalContext)
                            : true
                    "
                >
                    <slot v-bind="option" name="option"></slot>
                </button>
            </template>
        </div>
        <div class="select-autocomplete__options" v-if="state.state == false">
            <div class="select-autocomplete__option">
                Ingrese y presione enter para buscar
            </div>
        </div>
        <div
            class="select-autocomplete__options"
            v-if="state.state == 'no-results'"
        >
            <div class="select-autocomplete__option">No hay resultados</div>
        </div>
        <div
            class="select-autocomplete__options"
            v-if="state.state == 'loading'"
        >
            <div class="select-autocomplete__option">
                <i class="fas fa-spinner fa-spin"></i> Cargando...
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
    paginator: {
        type: Object,
        required: true,
        default: {},
    },
    state: {
        type: Object,
        required: true,
        default: {},
    },
    itemConditional: {
        type: [Function],
        required: false,
        default: null,
    },
    allowNull: {
        type: Boolean,
        required: false,
        default: true,
    },
    modalData: {
        type: Object,
        required: false,
        default: null,
    },
});

const inputSearch = ref(null);
props.state['inputSearch'] = inputSearch;
window.SelectAutocompleteState = props.state;

const selected = (option) => {
    /*
    console.log({
        'props.state.selected': props.state.selected,
        'option': option,
        'props.state.optionKey': props.state.optionKey,
    })
    */
    if (!option) {
        return props.state.selected == null;
    }
    if (props.state.selected) {
        if (Array.isArray(props.state.selected)) {
            return props.state.selected.find(
                (selected) =>
                    selected[props.state.optionKey] ==
                    option[props.state.optionKey]
            );
        } else {
            return props.state.selected == option[props.state.optionKey];
        }
    }
};

const select = (option) => {
    // si ya está seleccionado, no hacer nada
    if (selected(option)) {
        return;
    }
    props.state.select(option);
    if (props.modalData) {
        props.modalData.callback.resolve(option);
    }
};

const nextFocus = (e) => {
    // Utilizo keydown en lugar dekeyup porque keydown funciona como longpress
    let options = document.activeElement;
    // check if element is input or button
    if (options.tagName == 'INPUT') {
        let next = options.nextElementSibling.children[0];
        if (next) {
            next.focus();
        }
    }
    if (options.tagName == 'BUTTON') {
        let next = options.nextElementSibling;
        if (next) {
            next.focus();
        }
    }
};

const previousFocus = (e) => {
    let options = document.activeElement;
    if (options.tagName == 'BUTTON') {
        // check if is first button
        if (options.previousElementSibling) {
            options.previousElementSibling.focus();
        } else {
            inputSearch.value.focus();
        }
        /*
        let previous = options.parentNode.previousElementSibling
        if (previous) {
            previous.focus();
        }
        */
    }
};
</script>

<style lang="scss" scoped>
.select-autocomplete {
    &__button {
        background: #ffffff;
        border: 1px solid #c1c1c1;
        border-radius: 4px;
        width: 100%;
        height: 48px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 2px;
    }
    &__dropdown {
        // max-width: 100%;
        width: 100%;
        position: absolute;
        top: 41px;
        left: 0;
        background: #ffffff;
        border: 1px solid #c1c1c1;
        border-radius: 0 0 8px 8px;
        z-index: 999;
        box-sizing: border-box;
    }
    &__search {
        width: 100%;
        height: 40px;
        border: none;
        border-bottom: 1px solid #c1c1c1;
        padding: 0 20px;
        font-size: 16px;
        line-height: 48px;
        color: #000000;
        outline: none;
        // margin-top: 8px;
        font-size: 14px;
    }
    &__options {
        overflow-y: auto;
        max-height: 300px;
        display: flex;
        flex-direction: column;
    }
    &__option {
        padding: 0 2px;
        font-size: 14px;
        line-height: 34px;
        color: #000000;
        cursor: pointer;
        white-space: nowrap;
        border-bottom: 1px solid #c1c1c1;
        user-select: none;
        border: none;
        width: 100%;
        outline: none;
        background-color: #fff;
        text-align: left;
        border: 2px solid transparent;
        &--selected {
            background-color: #607d8b52;
        }
        &:hover {
            background-color: #f5f5f5;
        }
        &:focus {
            border: 2px solid #c61d91;
        }
    }
}
.input--small {
    .select-autocomplete {
        &__dropdown {
            top: 31px;
        }
    }
}
</style>
