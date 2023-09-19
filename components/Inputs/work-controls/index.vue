<template>
    <div class="controls">
        <!-- Controles de estado -->
        <div
            class="control control--blue cursor-pointer"
            @click="changeState('iniciado')"
            v-if="localState == 'sin-iniciar'"
        >
            <i class="fas fa-play"></i> Iniciar
        </div>
        <div
            class="control control--yellow cursor-pointer"
            @click="changeState('pausado')"
            v-if="localState == 'iniciado'"
        >
            <i class="fas fa-pause"></i> Pausar
        </div>
        <div
            class="control control--blue cursor-pointer"
            @click="changeState('iniciado')"
            v-if="localState == 'pausado'"
        >
            <i class="fas fa-play"></i> Reanudar
        </div>
        <div
            class="control cursor-pointer"
            @click="changeState('finalizado')"
            v-if="localState == 'iniciado' || localState == 'pausado'"
        >
            <i class="far fa-square fa-lg"></i> Listo
        </div>
        <div
            class="control control--disabled"
            v-if="localState == 'sin-iniciar'"
        >
            <i class="far fa-square fa-lg"></i> Listo
        </div>
        <div
            class="control control--green"
            v-if="localState == 'finalizado'"
        >
            <i class="fas fa-check-square fa-lg"></i> Listo
        </div>
        <!-- Controles para el supervisor, para correcciones -->
        <div
            class="control control--yellow cursor-pointer"
            @click="supervisorControls"
            v-if="userCan(permissionSupervisor) && localState == 'finalizado'"
        >
            <i class="fas fa-pen"></i> Corregir
        </div>

    </div>
</template>

<script setup>
import { computed } from '@vue/reactivity';
import { reactive, ref, onMounted, watchEffect } from 'vue'
import supervisorControlsModal from './supervisorControlsModal.vue'
/*
posibles states:
sin-iniciar
iniciado
pausado
finalizado
*/

const props = defineProps({
    refKey: {
        type: [String, Number],
        required: true,
    },
    refRaw: {
        type: [Object],
        required: false,
    },
    state: {
        type: [String, Number],
        required: true,
    },
    changeMethod: {
        type: Function,
        required: true,
    },
    permissionSupervisor: {
        type: String,
        required: false,
        default: '',
    },
})
const emit = defineEmits(['update:state', 'change'])
const localState = ref(props.state)

const confirmationChange = (state) => {
    localState.value = state
}
const changeState = (state) => {
    return props.changeMethod(props.refKey, state, confirmationChange, props.refRaw)
}
const supervisorControls = () => {
    const modal = awesomeModal.open({
        type: 'component',
        component: supervisorControlsModal,
        props: props,
    })
    modal.promise.then((data) => {
        if (data == 'reiniciar') {
            changeState('reiniciar')
        }
    })
    modal.promise.catch((error) => {
    })
}
</script>

<style lang="scss" scoped>
.controls{
    display: flex;
    gap: 7px;
    justify-content: flex-end;
}
.control {
    font-family: 'Inter';
    font-style: normal;
    font-weight: 500;
    font-size: 16px;
    line-height: 19px;

    /* Negro */

    color: #0C0C0C;


    user-select: none;
    /* botón check */
    box-sizing: border-box;

    /* Auto layout */

    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 10px 24px;
    gap: 10px;

    width: 134px;
    height: 40px;

    /* Gris medio */

    border: 1px solid #9A9A9A;
    border-radius: 40px;
    &--yellow {
        background: rgba(240, 218, 20, 0.2);
        border: 1px solid #9A9A9A;
    }
    &--blue {
        background: #DBF5FF;
        border: 1px solid #9A9A9A;
    }
    &--green {
        background: #E3F4EC;
        border: 1px solid #00A651;
        i {
            color: #00A651;
        }
    }
    &--disabled {
        border: 1px solid #D5D5D5;
        border-radius: 40px;
        color: #9A9A9A;
    }
}
</style>
