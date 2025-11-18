<template>
    <div>
        <div class="formatted-date__time">
            {{ time }}
        </div>
    </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';

const props = defineProps({
    seconds: {
        type: [String, Number],
        required: true,
    },
    increase: {
        type: Boolean,
        default: false,
        required: false,
    },
});
const seconds = ref(parseInt(props.seconds)); // la variable que queremos incrementar
function sumarSegundo() {
    if (props.increase) {
        seconds.value++; // sumamos uno a la variable
        // console.log(segundos); // mostramos el valor por consola
    }
}
let interval = setInterval(sumarSegundo, 1000); // llamamos a la función cada 1000 milisegundos (1 segundo)
// clearInterval(interval);
watch(
    () => props.seconds,
    (newValue, oldValue) => {
        seconds.value = parseInt(props.seconds);
    }
);
const time = computed(() => {
    return window.formatSeconds(seconds.value);
});
</script>

<style lang="scss" scoped>
.formatted-date__time {
    font-weight: 400;
    font-size: 14px;
    line-height: 17px;
    text-align: center;
    color: #0c0c0c;
}
</style>
