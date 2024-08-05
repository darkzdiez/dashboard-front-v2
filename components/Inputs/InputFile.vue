<template>
    <label class="input col-1" :class="{ 'input--error': error.length }">
        <span v-if="label">{{ label }}</span>
        <input
            :type="'file'"
            :required="false"
            :disabled="disabled"
            v-on:change="onFileChange($event)"
            ref="input"
        >
        <div class="input__layout">
            <div class="input__preview">
                <img :src="previewPATH" alt="" v-if="previewPATH">
                <img :src="fileUrl" alt="" v-else-if="fileUrl">
            </div>
            <div class="input__text">
                {{ preview }}
            </div>
            <div class="input__actions">
                <button
                    type="button"
                    class="btn btn--red"
                    v-if="preview"
                    @click.prevent="preview = ''; previewPATH = ''; $refs.input.value = ''"
                >
                    <i class="fas fa-trash"></i>
                </button>
                <a
                    :href="fileUrl"
                    target="_blank"
                    class="btn btn--lightblue"
                    v-if="fileUrl && !preview"
                >
                    <i class="fas fa-download"></i> Descargar
                </a>
                <button
                    type="button"
                    class="btn btn--green"
                    @click="$refs.input.click()"
                >
                    <i class="fas fa-upload"></i>
                </button>
            </div>
        </div>
        <InputErrors :errors="error" />
    </label>
</template>

<script setup>
import { reactive, ref, onMounted, watchEffect } from 'vue'

defineProps({
    label: {
        type: String,
        required: true,
    },
    modelValue: {
        type: [String, Number, File, Blob, null],
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
    fileUrl: {
        type: String,
        required: false,
    },
})
const emit = defineEmits(['update:modelValue', 'change'])

const preview = ref('')
const previewPATH = ref('')

const onFileChange = (event) => {
    const file = event.target.files[0]
    // console.log(file)
    emit('update:modelValue', file)
    emit('change', file)
    if (file) {
        preview.value = file.name
        // Si es una imagen
        let imageType = /image.*/
        if (file.type.match(imageType)) {
            let reader = new FileReader()
            reader.onload = (e) => {
                previewPATH.value = URL.createObjectURL(file)
            }
            reader.readAsDataURL(file)
        }
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
            font-size: 14px;
            margin-bottom: 9px;
            display: block;
        }
        input {
            width: 100%;
            height: 48px;
            border: 1px solid #C4C4C4;
            border-radius: 4px;
            padding: 0 15px;
            box-sizing: border-box;
            display: none;
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
    }
    .input {
        &__layout {
            display: flex;
            width: 100%;
            height: 50px;
            justify-content: space-between;
            background-color: #FFF;
            align-items: center;
            border: 1px solid #C4C4C4;
            border-radius: 4px;
            overflow: hidden;
        }
        &__preview {
            height: 100%;
            img {
                width: 100%;
                height: 100%;
                object-fit: contain;
            }
        }
        &__text {
            flex-grow: 1;
            justify-content: flex-start;
            align-items: center;
            padding: 5px;
            box-sizing: border-box;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
        }
        &__actions {
            display: flex;
            .btn {
                height: 50px;
                border-radius: 0;
                /*
                &:first-child {
                    // border-radius: 4px 0 0 4px;
                }
                &:last-child {
                    // border-radius: 0 4px 4px 0;
                }
                */
            }
        }
    }
</style>