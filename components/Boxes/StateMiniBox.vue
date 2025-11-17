<script setup>
const props = defineProps({
    label: {
        type: [String, Number],
        required: true,
    },
    primaryText: {
        type: [String, Number],
        required: true,
    },
    secondaryText: {
        type: [String, Number],
        required: false,
    },
    colors: {
        type: [String, Array, Object],
        required: false,
        default: 'default', // default | input
    },
    to: {
        type: [String],
        required: false,
        default: null,
    },
});
</script>
<template>
    <router-link class="StateMiniBox" :to="props.to" v-if="props.to">
        <div class="StateMiniBox__label">
            <span>{{ props.label }}</span>
            <svg
                width="11"
                height="19"
                viewBox="0 0 11 19"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M1 1.5L9 9.5L1 17.5"
                    stroke="#00AEEE"
                    stroke-width="2"
                />
            </svg>
        </div>
        <div class="StateMiniBox__primary-text">
            <span>{{ props.primaryText }}</span>
            <span
                class="StateMiniBox__secondary-text"
                v-html="props.secondaryText"
            ></span>
        </div>
        <StateMiniBoxColors :colors="props.colors" />
    </router-link>
    <div class="StateMiniBox" v-else>
        <div class="StateMiniBox__label">
            <span>{{ props.label }}</span>
            <svg
                width="11"
                height="19"
                viewBox="0 0 11 19"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M1 1.5L9 9.5L1 17.5"
                    stroke="#00AEEE"
                    stroke-width="2"
                />
            </svg>
        </div>
        <div class="StateMiniBox__primary-text">
            <span>{{ props.primaryText }}</span>
            <span class="StateMiniBox__secondary-text">{{
                props.secondaryText
            }}</span>
        </div>
        <StateMiniBoxColors :colors="props.colors" />
    </div>
</template>

<style lang="scss">
.StateMiniBox {
    background-color: #fff;
    padding: 32px 24px;
    text-decoration: none;
    user-select: none;
    text-decoration: none;
    &__label {
        color: #0c0c0c;
        font-weight: 600;
        font-size: 24px;
        text-decoration: none;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
    }
    &__primary-text {
        color: #0c0c0c;
        font-weight: 600;
        font-size: 24px;
        text-decoration: none;
        margin-bottom: 24px;
        display: flex;
        gap: 8px;
        justify-content: flex-start;
        align-items: center;
    }
    &__secondary-text {
        font-weight: 400;
        font-size: 16px;
        text-decoration: none;
        color: #949494;
    }
    &__colors {
        display: flex;
        justify-content: space-between;
        align-items: stretch;
        height: 8px;
        border-radius: 4px;
        overflow: hidden;
    }
    &__color {
        flex-grow: 1;
    }
}
</style>
