<template>
    <div class="input col-1" :class="{ 'input--error': error && error.length }">
        <span v-if="label">{{ label }}</span>
        <div 
            class="input-fake" 
            :class="{ 'disabled': disabled }"
            @click.stop="triggerUpload"
        >
            <div class="input-fake__content">
                <i :class="['input-fake__icon', fileIcon, fileColorClass]"></i>
                <span class="input-fake__text" :class="{ 'placeholder': !fileName }">
                    {{ fileName || placeholder }}
                </span>
            </div>
            <div class="input-fake__actions">
                 <button 
                    type="button" 
                    v-if="modelValue" 
                    @click.stop="clearFile" 
                    class="action-btn text-red"
                    title="Eliminar archivo"
                >
                    <i class="fas fa-times"></i>
                 </button>
                 <a 
                    v-if="fileUrl && !modelValue" 
                    :href="fileUrl" 
                    target="_blank" 
                    class="action-btn text-blue" 
                    @click.stop
                    title="Descargar archivo"
                >
                    <i class="fas fa-download"></i>
                 </a>
                 <button 
                    type="button" 
                    class="action-btn"
                    title="Seleccionar archivo"
                >
                    <i class="fas fa-folder-open"></i>
                 </button>
            </div>
        </div>
        <input
            type="file"
            ref="inputRef"
            class="hidden-input"
            :disabled="disabled"
            @change="onFileChange"
            :accept="accept"
        />
        <InputErrors :errors="error" />
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
    label: { type: String, required: true },
    modelValue: { type: [File, String, null], default: null },
    disabled: { type: Boolean, default: false },
    error: { type: Array, default: () => [] },
    fileUrl: { type: String, default: '' },
    placeholder: { type: String, default: 'Seleccionar archivo...' },
    accept: { type: String, default: '' },
    resetTrigger: { type: Number, default: 0 },
});

const emit = defineEmits(['update:modelValue', 'change']);

const inputRef = ref(null);

const fileName = computed(() => {
    if (props.modelValue instanceof File) {
        return props.modelValue.name;
    }
    // Si hay fileUrl pero no hay un archivo nuevo seleccionado, mostramos el nombre del archivo remoto
    if (props.fileUrl && !props.modelValue) {
        try {
            // Intentar obtener el nombre del archivo de la URL
            const urlParts = props.fileUrl.split('/');
            return urlParts[urlParts.length - 1] || 'Archivo actual';
        } catch (e) {
            return 'Archivo actual';
        }
    }
    return '';
});

const fileIcon = computed(() => {
    let name = '';
    if (props.modelValue instanceof File) {
        name = props.modelValue.name;
    } else if (props.fileUrl) {
        name = props.fileUrl;
    }

    if (!name) return 'fas fa-cloud-upload-alt'; // Icono por defecto para subir

    const ext = name.split('.').pop().toLowerCase();
    switch (ext) {
        case 'pdf': return 'fas fa-file-pdf';
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
        case 'webp':
        case 'svg': return 'fas fa-file-image';
        case 'doc':
        case 'docx': return 'fas fa-file-word';
        case 'xls':
        case 'xlsx':
        case 'csv': return 'fas fa-file-excel';
        case 'ppt':
        case 'pptx': return 'fas fa-file-powerpoint';
        case 'zip':
        case 'rar':
        case '7z': return 'fas fa-file-archive';
        case 'txt': return 'fas fa-file-alt';
        case 'mp4':
        case 'avi':
        case 'mov': return 'fas fa-file-video';
        case 'mp3':
        case 'wav': return 'fas fa-file-audio';
        default: return 'fas fa-file';
    }
});

const fileColorClass = computed(() => {
    let name = '';
    if (props.modelValue instanceof File) {
        name = props.modelValue.name;
    } else if (props.fileUrl) {
        name = props.fileUrl;
    }

    if (!name) return '';

    const ext = name.split('.').pop().toLowerCase();
    switch (ext) {
        case 'pdf': return 'coloricon--red';
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
        case 'webp':
        case 'svg': return 'coloricon--purple';
        case 'doc':
        case 'docx': return 'coloricon--blue';
        case 'xls':
        case 'xlsx':
        case 'csv': return 'coloricon--green';
        case 'ppt':
        case 'pptx': return 'coloricon--orange';
        case 'zip':
        case 'rar':
        case '7z': return 'coloricon--yellow';
        case 'txt': return 'coloricon--gray';
        case 'mp4':
        case 'avi':
        case 'mov': return 'coloricon--pink';
        case 'mp3':
        case 'wav': return 'coloricon--cyan';
        default: return 'coloricon--gray';
    }
});

const triggerUpload = () => {
    console.log('triggerUpload called');
    if (!props.disabled) {
        inputRef.value.click();
    }
};

const onFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
        emit('update:modelValue', file);
        emit('change', file);
    } else {
        // Si el usuario cancela la selección, no hacemos nada o podríamos limpiar
        // Depende del comportamiento deseado. Por ahora mantenemos el anterior si cancela.
    }
};

const clearFile = () => {
    if (inputRef.value) inputRef.value.value = '';
    emit('update:modelValue', null);
    emit('change', null);
};

watch(() => props.resetTrigger, () => {
    clearFile();
});

</script>

<style lang="scss" scoped>
div[class*='input'] {
    display: block;
    > span {
        font-weight: 500;
        line-height: 19px;
        color: #9a9a9a;
        font-size: 14px;
        margin-bottom: 6px;
        display: block;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    
    .input-fake {
        width: 100%;
        height: 48px;
        border: 1px solid #c4c4c4;
        border-radius: 4px;
        padding: 0 15px;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: #fff;
        cursor: pointer;
        transition: all 0.2s ease;
        position: relative;

        &:hover {
             border-color: #2e2e2e;
        }
        
        &.disabled {
            background-color: #f5f5f5;
            cursor: not-allowed;
            opacity: 0.7;
            &:hover {
                border-color: #c4c4c4;
            }
        }

        &__content {
            display: flex;
            align-items: center;
            flex-grow: 1;
            overflow: hidden;
            gap: 12px;
        }

        &__icon {
            color: #656565;
            font-size: 20px;
            width: 24px;
            text-align: center;
            flex-shrink: 0;

            &.coloricon--red { color: #e74c3c; }
            &.coloricon--blue { color: #2980b9; }
            &.coloricon--green { color: #27ae60; }
            &.coloricon--orange { color: #d35400; }
            &.coloricon--purple { color: #8e44ad; }
            &.coloricon--yellow { color: #f39c12; }
            &.coloricon--gray { color: #7f8c8d; }
            &.coloricon--pink { color: #e91e63; }
            &.coloricon--cyan { color: #00bcd4; }
        }

        &__text {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            color: #333;
            font-size: 14px;
            margin: auto 0;
            
            &.placeholder {
                color: #9a9a9a;
            }
        }

        &__actions {
            display: flex;
            align-items: center;
            gap: 4px;
            margin-left: 10px;
            flex-shrink: 0;
        }
    }

    &.input--error {
        color: #ff0000;
        .input-fake {
            border: 1px solid #ff0000;
            &:hover {
                box-shadow: 0 0 2px 1px rgba(#ff0000, 0.5);
            }
        }
    }
}

.hidden-input {
    display: none;
}

.action-btn {
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 6px;
    color: #9a9a9a;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;

    &:hover {
        color: #333;
        background-color: rgba(0,0,0,0.05);
    }

    &.text-red:hover { 
        color: #dc3545; 
        background-color: rgba(220, 53, 69, 0.1);
    }
    &.text-blue:hover { 
        color: #007bff; 
        background-color: rgba(0, 123, 255, 0.1);
    }
}

// Small variant
div[class*='input--small'] {
    .input-fake {
        height: 33px;
        padding: 0 10px;
        
        &__content {
            gap: 8px;
        }

        &__icon {
            font-size: 16px;
            width: 18px;
        }
        
        &__text {
            font-size: 13px;
        }

        &__actions {
            gap: 2px;
        }
    }
    
    .action-btn {
        padding: 4px;
        font-size: 12px;
    }
}
</style>