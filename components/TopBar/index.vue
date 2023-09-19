<script setup>
    import { reactive, ref, watch, inject } from 'vue'
    const $globalState = inject('$globalState')

</script>

<template>
    <div class="top-bar">
        <button class="top-bar__button" @click="$globalState.sidebar.show.toggle">
            <i class="fas fa-bars"></i>
        </button>
        <TopBarContent />
    </div>
</template>

<style lang="scss">
    .top-bar {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        padding: 0 20px;
        height: 60px;
        background-color: var(--darkgray);
        color: #fff;
        &__button {
            background-color: transparent;
            border: none;
            outline: none;
            box-shadow: none;
            display: inline-block;
            height: 100%;
            cursor: pointer;
            color: white;
            padding: 0 14px;
            &:hover {
                background-color: rgba(0, 0, 0, 0.1);
            }
        }
        &__title {
            display: flex;
            height: 100%;
            padding: 8px 0;
            box-sizing: border-box;
            align-items: center;
        }
        &__menu {
            margin-left: auto;
            z-index: 1;
            display: flex;
            height: 100%;
        }
        &__item {
            display: flex;
            padding: 0 14px;
            height: 100%;
            color: white;
            text-decoration: none;
            gap: 4.5px;
            cursor: pointer;
            justify-content: center;
            align-items: center;
        }
    }
    .task-card {
        display: flex;
        text-align: left;
        color: #555;
        gap: 5px;
        &__icon {
            color: var(--yellow);
        }
        &__text {
            font-size: 11px;
            p, h3 {
                margin: 0;
            }
        }
        &__date {
            font-size: 10px;
            color: #555;
        }
    }
</style>