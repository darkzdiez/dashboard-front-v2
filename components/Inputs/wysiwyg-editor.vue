<template>
    <div>
        <div class="flex flex-wrap">
            <button @click="applyBold" class="button" type="button">
                <i class="fas fa-bold"></i>
            </button>
            <button @click="applyItalic" class="button" type="button">
                <i class="fas fa-italic"></i>
            </button>
            <button @click="applyHeading" class="button" type="button">
                <i class="fas fa-heading"></i>
            </button>
            <button @click="applyUl" class="button" type="button">
                <i class="fas fa-list-ul"></i>
            </button>
            <button @click="applyOl" class="button" type="button">
                <i class="fas fa-list-ol"></i>
            </button>
            <button @click="undo" class="button" type="button">
                <i class="fas fa-undo"></i>
            </button>
            <button @click="redo" class="button" type="button">
                <i class="fas fa-redo"></i>
            </button>
            <button @click="insertImage" class="button" type="button">
                <i class="fas fa-image"></i>
            </button>
            <button @click="insertText" class="button" type="button">
                <i class="fas fa-font"></i>
            </button>
            <button @click="insertLink" class="button" type="button">
                <i class="fas fa-link"></i>
                Enlace
            </button>
        </div>

        <div
            @input="onInput"
            v-html="innerValue"
            contenteditable="true"
            class="wysiwyg-output"
        ></div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue';

/*
import { Marked } from '@ts-stack/markdown'
import TurndownService from 'turndown'
*/
// https://dev.to/thormeier/build-your-own-wysiwyg-markdown-editor-for-vue-318j
const props = defineProps({
    modelValue: {
        type: String,
        required: true,
    },
});
const emit = defineEmits(['update:modelValue', 'change']);

// const innerValue = Marked.parse(props.modelValue) || '<p><br></p>'
const innerValue = ref(props.modelValue || '<p><br></p>');

const ignorarModel = ref(false);
watch(
    () => props.modelValue,
    (newValue, oldValue) => {
        if (!ignorarModel.value) {
            innerValue.value = props.modelValue || '<p><br></p>';
        } else {
            ignorarModel.value = false;
        }
    }
);

document.execCommand('defaultParagraphSeparator', false, 'p');

const onInput = (event) => {
    /*
    const turndown = new TurndownService({
        emDelimiter: '_',
        linkStyle: 'inlined',
        headingStyle: 'atx'
    })
    let content = turndown.turndown(event.target.innerHTML)
    */
    let content = event.target.innerHTML;
    ignorarModel.value = true;
    emit('update:modelValue', content);
};
const applyBold = () => {
    document.execCommand('bold');
};
const applyItalic = () => {
    document.execCommand('italic');
};
const applyHeading = () => {
    document.execCommand('formatBlock', false, '<h1>');
};
const applyUl = () => {
    document.execCommand('insertUnorderedList');
};
const applyOl = () => {
    document.execCommand('insertOrderedList');
};
const undo = () => {
    document.execCommand('undo');
};
const redo = () => {
    document.execCommand('redo');
};
// insertar imagen
const insertImage = () => {
    const url = prompt('Enter the image URL');
    if (url) {
        document.execCommand('insertImage', false, url);
    }
};
// insertar texto
const insertText = () => {
    const text = prompt('Enter the text');
    if (text) {
        document.execCommand('insertText', false, text);
    }
};

// insertar enlace
const insertLink = () => {
    const url = prompt(
        'Ingrese la URL del enlace, puede ingresar una varible de la plantilla, ej: <ENLACE_URL_SOLICITUD>'
    );
    const text = prompt('Enter the link text');
    if (url && text) {
        document.execCommand(
            'insertHTML',
            false,
            `<a href="${url}">${text}</a>`
        );
    }
};
</script>
<style lang="scss" scoped>
.wysiwyg-output {
    border: 1px solid #c4c4c4;
    border-radius: 4px;
    margin-top: 5px;
    padding: 0 15px;
    min-height: 230px;
    max-height: 350px;
    overflow: scroll;
    background-color: #fff;
    &:focus,
    &:focus-visible {
        box-shadow: 0 0 2px 1px rgba(0, 166, 81, 0.5);
        // outline: -webkit-focus-ring-color auto 1px;
        outline: none;
    }
}
</style>
