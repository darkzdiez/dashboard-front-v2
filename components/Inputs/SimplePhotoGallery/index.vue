<template>
    <div class="SimplePhotoGallery">
        <div class="SimplePhotoGallery__controls">
            <button
                class="btn btn--red"
                v-if="earringsToUpload().length > 0"
                @click="uploadFiles"
            >
                <i class="fas fa-upload"></i>
                Subir ({{ earringsToUpload().length }})
            </button>
            <button
                class="btn btn--lightblue"
                @click="addFiles"
            >
                <i class="fas fa-plus"></i>
                Añadir Foto
            </button>
        </div>
        <div class="SimplePhotoGallery__photos">
            <div
                class="SimplePhotoGallery__photo"
                v-for="(photo, index) in photos"
                :key="index"
                :style="{ backgroundImage: `url(${previewPath(photo)})` }"
                @click="Object.prototype.toString.call(photo) === '[object File]' ? null : showPhoto(photo)"
            >
                <button
                    class="SimplePhotoGallery__remove"
                    v-if="Object.prototype.toString.call(photo) === '[object File]'"
                    @click.stop="Object.prototype.toString.call(photo) === '[object File]' ? photos.splice(index, 1) : null"
                >
                    <i class="fas fa-times"></i>
                </button>   
            </div>
        </div>
        <input
            class="visually-hidden"
            type="file"
            @change="onFileChange($event)"
            multiple ref="fileInput"
            accept="image/*"
        >
    </div>
</template>

<script setup>
import { reactive, ref, watch, onMounted } from 'vue'
import Show from './Show.vue'
// modelValue: puede ser un String, Number o null
const props = defineProps({
    modelValue: {
        type: [String, Number, null],
        required: true,
    },
})
const emit = defineEmits(['update:modelValue', 'change'])

const fileInput = ref(null)
const photos = reactive([])

const onFileChange = (e) => {
    const files = e.target.files
    if (files.length > 0) {
        // image/png, image/gif, image/jpeg, image/tiff, image/svg+xml, image/bmp, image/webp
        // valida que cada archivo sea una imagen
        for (let i = 0; i < files.length; i++) {
            if (!files[i].type.match('image.*')) {
                alert('Solo se permiten imágenes')
            } else {
                photos.push(files[i])
            }
        }
    }
}

const addFiles = () => {
    fileInput.value.click()
}

const earringsToUpload = () => {
    return photos.filter((photo) => {
        return photo instanceof File
    })
}


const previewPath = (file) => {
    if (file instanceof File) {
        return URL.createObjectURL(file)
    } else {
        return file.url
    }
}

const getData = () => {
    fetch(`/api/simple-photo-gallery/${props.modelValue}`)
        .then((response) => response.json())
        .then((data) => {
            photos.push(...data.photos)
        })
}
if ( props.modelValue ) {
    getData()
}

// send files to server using fetch
const uploadFiles = () => {
    const formData = new FormData()
    const files = earringsToUpload()
    if (files.length == 0) {
        return
    }
    if (props.modelValue) {
        formData.append('gallery_id', props.modelValue)
    }
    files.forEach((file) => {
        formData.append('photos[]', file)
    })
    fetch('/api/simple-photo-gallery', {
        method: 'POST',
        body: formData,
    })
    .then((response) => response.json())
    .then((data) => {
        // se notifica al componente padre cambiando el valor de la propiedad modelValue
        // el componente padre debe escuchar el evento update:modelValue
        emit('update:modelValue', data.gallery_id)

        // limpiar el array
        photos.splice(0, photos.length)

        // agregar los nuevos datos
        getData()

    })
}
const showPhoto = (photo) => {
    const modal = awesomeModal.open({
        type: 'component',
        component: Show,
        photo: photo,
    })
    modal.promise.then((data) => {
        if (data == 'photo-deleted') {
            photos.splice(photos.indexOf(photo), 1)
        }
    })
    modal.promise.catch((error) => {
        console.log('Dio error')
    })
}
</script>

<style lang="scss" scoped>
.visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    border: 0;
}
.SimplePhotoGallery {
    &__controls {
        display: flex;
        justify-content: flex-end;
        margin-bottom: 15px;
        gap: 15px;
    }
    /*
        cada imagen debe medir 392px de ancho x 261px de alto o proporcionalmente
        el alto tiene que ser un 66% del ancho
    */
    &__photos {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        grid-gap: 15px;
        @media (max-width: 992px) {
            grid-template-columns: repeat(2, 1fr);
        }
        @media (max-width: 768px) {
            grid-template-columns: repeat(1, 1fr);
        }
    }
    &__photo {
        width: 100%;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        border-radius: 0;
        cursor: pointer;
        transition: all 0.3s ease-in-out;
        position: relative;
        &:hover {
            transform: scale(1.02);
            box-shadow: 0 0 5px 0 rgba(0, 0, 0, 0.2);            
        }
        &::after {
            content: '';
            display: block;
            padding-bottom: 66.5%;
        }
    }
    &__remove {
        right: 0;
        top: 0;
        position: absolute;
        background-color: var(--red);
        border: none;
        margin: 0;
        color: #FFF;
        padding: 9px 18px;
        opacity: .7;
        transition: all .3s ease-in-out;
        &:hover {
            opacity: 1;
        }
    }

}
</style>
