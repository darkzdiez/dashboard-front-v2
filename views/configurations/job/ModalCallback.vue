<template>
    <div class="modal container">
        <div
            class="modal__header"
            style="position: sticky; top: 0; background-color: #fff"
        >
            <h1 class="controls__title">Solicitar cotización</h1>
            <div class="modal__close" @click="close">
                <i class="fas fa-times"></i>
            </div>
        </div>
        <div class="modal__body">
            <pre>{{ data.rawData.jobCallback }}</pre>
        </div>
    </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const props = defineProps({
    data: {
        type: Object,
        required: true,
    },
});

const close = () => {
    props.data.callback.resolve('Close on overlay click');
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

    height: fit-content;
    min-height: 300px;
    width: calc(100% - 80px);
    max-width: 1000px;
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

pre {
    max-width: 100%;
    overflow: auto;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    font-size: 13px;
    line-height: 1.45;
}

@media (max-width: 768px) {
    .modal {
        width: calc(100vw - 24px);
        max-height: calc(100vh - 20px);
        min-height: 0;
        margin: 10px auto;

        &__header {
            padding: 18px 16px 14px;
            gap: 12px;
        }

        &__body {
            padding: 0 16px 20px;
        }
    }

    h1.controls__title {
        font-size: 20px !important;
        line-height: 1.25;
        white-space: normal;
    }

    pre {
        font-size: 12px;
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

input {
    width: 100%;
    height: 48px;
    border: 1px solid #c4c4c4;
    border-radius: 4px;
    padding: 0 15px;
    box-sizing: border-box;
    display: none;
    &:-webkit-autofill,
    &:-webkit-autofill:hover,
    &:-webkit-autofill:focus,
    &:-webkit-autofill:active {
        -webkit-box-shadow: 0 0 0 30px white inset !important;
    }
    &:focus,
    &:valid,
    &:not(:placeholder-shown) {
        outline: none;
        & + span {
            top: 5px;
            font-size: 12px;
            color: #656565;
            opacity: 0.8;
        }
    }
    &:focus {
        box-shadow: 0 0 2px 1px rgba(#00a651, 0.5);
    }
    &::-webkit-input-placeholder {
        opacity: 1;
    }
}
.table {
    border: none;
    table-layout: fixed;
    border-bottom: 1px solid #e1e1e1;
    tbody {
        tr {
            th {
                white-space: nowrap;
                padding: 3px 10px;
                font-size: 13px;
                line-height: 15px;
                font-weight: 600;
            }
            th,
            td {
                text-align: left;
            }
        }
    }
}
.block-label {
    font-weight: 500;
    line-height: 19px;
    color: #9a9a9a;
    margin-bottom: 9px;
    display: block;
    white-space: nowrap;
    font-size: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
}
.select-autocomplete__multiple-item {
    background-color: #f4f4f4;
    border-radius: 4px;
    display: flex;
    align-items: center;
    box-sizing: border-box;
    color: #0c0c0c;
    border: none;
    padding: 5px 9px;
}
</style>
