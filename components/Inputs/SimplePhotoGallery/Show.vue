<template>
    <div class="modal container">
        <div class="modal__header">
            <h1 class="controls__title">
                Foto: {{ data.rawData.photo.original_name }}
            </h1>
            <div class="modal__close" @click="close">
                <i class="fas fa-times"></i>
            </div>
        </div>
        <div class="modal__body grid-3 gap-15">
            <div class="col-2">
                <img :src="data.rawData.photo.url" alt="" class="img-fluid" />
            </div>
            <div class="col-1">
                <InputFake
                    label="Nombre"
                    placeholder=""
                    :text="data.rawData.photo.original_name"
                    :error="[]"
                    :borderless="false"
                />
                <InputFake
                    label="Tamaño"
                    placeholder=""
                    :text="data.rawData.photo.size_human"
                    :error="[]"
                    :borderless="false"
                />
                <InputFake
                    label="Dimensiones"
                    placeholder=""
                    :text="
                        data.rawData.photo.width +
                        ' x ' +
                        data.rawData.photo.height
                    "
                    :error="[]"
                    :borderless="false"
                />
                <InputFake
                    label="Fecha de creación"
                    placeholder=""
                    :text="data.rawData.photo.created_at_human"
                    :error="[]"
                    :borderless="false"
                />
                <div class="grid-2 gap-15 mt-15">
                    <button class="btn btn btn--red col-2" @click="deletePhoto">
                        <i class="fas fa-trash-alt"></i> Eliminar
                    </button>
                    <button
                        class="btn btn btn--lightblue-outline col-1"
                        @click="close"
                    >
                        <i class="fas fa-times"></i> Cerrar
                    </button>
                    <a
                        class="btn btn btn--lightblue col-1"
                        target="_blank"
                        :href="data.rawData.photo.url"
                    >
                        <i class="fas fa-download"></i> Descargar
                    </a>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    data: {
        type: Object,
        required: true,
    },
});
const close = () => {
    // props.data.callback.reject('Close on overlay click')
    props.data.callback.resolve('closed');
};

const typeElement = Object.prototype.toString.call(props.data.rawData.photo);

const deletePhoto = () => {
    window.awesomeModal
        .confirm('¿Está seguro?', '¿Está seguro que desea eliminar esta foto?')
        .then((result) => {
            if (result) {
                let modal = window.awesomeModal.loading();
                httpRequest({
                    url:
                        window.public_path +
                        '/api/simple-photo-gallery/' +
                        props.data.rawData.photo.id +
                        '/delete',
                    method: 'GET',
                })
                    .then((data) => {
                        modal.close();
                        window.awesomeModal.alert(
                            '¡Listo!, La foto se ha eliminado correctamente'
                        );
                        props.data.callback.resolve('photo-deleted');
                    })
                    .catch((error) => {
                        modal.close();
                        props.data.callback.resolve('photo-deleted-error');
                    });
            }
        });
};
</script>

<style lang="scss" scoped>
.modal {
    background-color: #ffffff;
    padding: 0;
    // min-height: calc(100% - 30px);
    margin-top: 15px;
    margin-bottom: 15px;

    max-height: calc(100vh - 30px);
    overflow: auto;
    &__header {
        padding: 30px 24px 20px 24px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    &__close {
        cursor: pointer;
        font-size: 25px;
        transition: all 0.3s ease;
        color: #656565;
        &:hover {
            color: #000;
        }
    }
    &__body {
        padding: 0 24px 42px 24px;
    }
    &__buttons {
        display: flex;
        gap: 15px;
        margin-left: auto;
        align-items: center;
        justify-content: center;
        width: 100%;
    }
}
.modal {
    animation: loading 0.5s ease-in-out;
    @keyframes loading {
        0% {
            transform: translate(0px, 1000px) scale(0.3);
        }
        100% {
            transform: translate(0px, 0px) scale(1);
        }
    }
}
.item {
    &__label {
        font-weight: 400;
        font-size: 16px;
        line-height: 19px;
        color: #919191;
        margin-bottom: 7.5px;
    }
    &__value {
        font-weight: 500;
        font-size: 16px;
        line-height: 19px;
        color: #0c0c0c;
    }
}
</style>
