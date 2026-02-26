<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const dropdownShow = ref(false);
const dropdownRef = ref(null);

const toggleDropdown = () => {
    dropdownShow.value = !dropdownShow.value;
};

const handleDocumentClick = (event) => {
    if (!dropdownRef.value) {
        return;
    }

    if (!dropdownRef.value.contains(event.target)) {
        dropdownShow.value = false;
    }
};

const handleKeydown = (e) => {
    if (e.key === 'Escape') {
        dropdownShow.value = false;
    }
};

onMounted(() => {
    window.addEventListener('keydown', handleKeydown);
    document.addEventListener('click', handleDocumentClick, true);
});

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown);
    document.removeEventListener('click', handleDocumentClick, true);
});
</script>

<template>
    <button
        ref="dropdownRef"
        class="dropdown"
        @click.stop="toggleDropdown"
        type="button"
    >
        <div class="dropdown__button">
            <slot name="button"></slot>
        </div>
        <div class="dropdown__menu" v-show="dropdownShow">
            <slot></slot>
        </div>
    </button>
</template>

<style lang="scss">
.dropdown {
    position: relative;
    border: none;
    outline: none;
    background-color: transparent;
    &__button {
        display: flex;
        cursor: pointer;
        gap: 4.5px;
        background-color: transparent;
        border: none;
        outline: none;
    }
    &__menu {
        max-height: 400px;
        overflow: auto;
        position: absolute;
        /*
            display: flex;
            flex-direction: column;
            */
        top: 100%;
        background: #fff;
        // left: 0;
        right: 0;
        border: 1px solid #d9d9d9;
        border-bottom: none;
        width: max-content;
        z-index: 10;
    }
    &__item {
        display: flex;
        cursor: pointer;
        gap: 4.5px;
        justify-content: flex-start;

        background: #fff;
        border: none;
        outline: none;
        box-shadow: none;

        border-bottom: 1px solid #d9d9d9;

        text-decoration: none;
        color: #000;

        overflow: hidden;
        white-space: nowrap;
        padding: 10px 15px;

        width: 100%;
        box-sizing: border-box;
        font-weight: 400;
        &:hover {
            background-color: #f5f5f5;
        }
        &:active {
            background-color: #d9d9d9;
        }
    }
}
</style>
