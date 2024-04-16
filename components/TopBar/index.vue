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
            z-index: 10;
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
            background: transparent;
            border: none;
        }
    }
    .task-card {
        display: flex;
        text-align: left;
        color: #555;
        gap: 5px;
        justify-content: space-between;
        position: relative;
        &__icon {
            color: var(--yellow);
        }
        &__text {
            font-size: 11px;
            flex-grow: 1;
            max-width: 260px;
            overflow: hidden;
            p, h3 {
                margin: 0;
            }
            h3 {
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
        }
        &__date {
            font-size: 10px;
            color: #555;
        }
        &__duration {
            font-size: 10px;
            color: #555;
            position: absolute;
            bottom: 10px;
            right: 15px;
        }
        &__show-more {
            justify-content: center !important;
            padding: 20px !important;
            opacity: .7 !important;
            font-size: 15px !important;
            &:hover {
                i {
                    animation: rotate 1s linear infinite;
                }
            }
        }

        // Si text-card esta en hover, el texto se muestra completo y se anima como un carousel
        &:hover {
            .task-card__text {
                h3 {
                    white-space: nowrap;
                    overflow: visible;
                    text-overflow: unset;
                    animation: carousel 10s linear infinite;
                }
            }
        }
    }
    @keyframes carousel {
        0% {
            transform: translateX(0);
        }
        100% {
            transform: translateX(-100%);
        }
    }

    @keyframes rotate {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
</style>