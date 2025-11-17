<script setup>
const props = defineProps({
    colors: {
        type: [String, Array, Object],
        required: false,
        default: 'default', // default | input
    },
});
</script>
<template>
    <div class="StateMiniBox__colors" v-if="typeof props.colors === 'string'">
        <div
            class="StateMiniBox__color"
            :style="{ backgroundColor: props.colors }"
        ></div>
    </div>
    <div
        class="StateMiniBox__colors"
        v-if="typeof props.colors === 'object' && Array.isArray(props.colors)"
    >
        <div
            class="StateMiniBox__color"
            v-for="color in props.colors"
            :style="{ backgroundColor: color }"
        ></div>
    </div>
    <div
        class="StateMiniBox__colors"
        v-if="typeof props.colors === 'object' && !Array.isArray(props.colors)"
    >
        <div
            class="StateMiniBox__color"
            v-for="color in Object.keys(props.colors)"
            :style="{
                backgroundColor: color,
                width: props.colors[color] + '%',
            }"
        ></div>
    </div>
</template>
