<script setup>
    import { RouterLink, RouterView } from 'vue-router'
    import { ref, inject } from 'vue'

    const $globalState = inject('$globalState')
</script>

<template>
    <div :class="'side-bar__wrapper ' + $globalState.sidebar.position.value + ' ' + $globalState.sidebar.place.value + ' ' + $globalState.sidebar.show.value">
        <div class="side-bar">
            <SidebarContent />
        </div>
    </div>
</template>

<style lang="scss">
    .side-bar {
        display: flex;
        flex-direction: column;
        min-width: 300px;
        max-width: 300px;
        background-color: #FFF;
        height: 100%;
        position: relative;
        &__wrapper {
            flex-grow: 1;
            overflow: hidden;
            transition: all 0.5s ease;
            z-index: 1;
            &--relative {
                position: relative;
            }
            &--absolute {
                position: absolute;
                bottom: 0;
                top: 0;
            }
            &--left {
                order: 1;
            }
            &--right {
                order: 3;
            }
            &--absolute#{&}--left {
                left: 0;
            }
            &--absolute#{&}--right {
                right: 0;
            }
            &--show {
                width: 300px;
                min-width: 300px;
                max-width: 300px;
            }
            &--hide {
                width: 0;
                min-width: 0;
                max-width: 300px;
                flex-grow: 0;
            }
        }
        &__title {
            padding: 22px 33px;
            color: #787878;
            font-size: 14px;
            letter-spacing: 1.61px;
        }
        &__logo {
            padding: 17px 0;
            text-align: center;
            background-color: var(--darkgray);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100px;
            box-sizing: border-box;
            img {
                height: 57px;
                max-width: 100%;
            }
        }
        &__menu {
            display: flex;
            flex-direction: column;
            width: 100%;
            padding-bottom: 45px;
            overflow-y: scroll;
			// scrollbar
			-ms-overflow-style: none;  /* IE and Edge */
			scrollbar-width: none;  /* Firefox */
			&::-webkit-scrollbar {
				display: none;  /* Chrome, Safari, Opera*/
			}
        }
        &__item {
            display: flex;
            align-items: center;
            padding: 15px 38px;
            color: #0C0C0C;
            text-decoration: none;
            i {
                margin-right: 10px;
                color: #656565;
                width: 30px;
                justify-content: flex-end;
                align-items: center;
                display: flex;
                img {
                    max-width: 19px;
                    max-height: 19px;
                    // filter to #656565
                    filter: invert(0.5) sepia(0) saturate(0) hue-rotate(0deg) brightness(0.5) contrast(0.5);
                }
            }
            &.router-link-active, &:hover {
                background-color: #E5F6ED;
                color: #00A651;
                i {
                    color: #00A651;
                    img {
                        // filter to #00A651
                        filter: invert(44%) sepia(21%) saturate(6741%) hue-rotate(125deg) brightness(92%) contrast(101%);
                    }
                }
            }
        }
        &__control {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 45px;
            border-top: 1px solid #d1d1d1;
            display: flex;
            background-color: #fff;
        }
        &__button {
            flex-grow: 1;
            border: none;
            background-color: transparent;
            color: #9d9d9d;
            cursor: pointer;
            i {
                font-size: 20px;
            }
            &:hover {
                color: #00A651;
            }
        }
    }
</style>