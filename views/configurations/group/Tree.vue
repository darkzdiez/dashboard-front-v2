<script setup>
    import { reactive } from "@vue/reactivity";

    defineProps({
        data: {
            type: Array,
            required: true,
        },
        parent: {
            type: Number,
            default: null,
        },
        level: {
            type: Number,
            default: 0,
        },
    })

    // El bgcolor sera calculado en base al nivel del elemento
    // Se comenzara con el color #e38383 y se ira moviendo, por ejemplo el 1 sera #e383a6 y asi se movera de lo mas
    // calido a lo mas frio
    const getBgColor = (level) => {
        const colors = [
            '#e38383',
            '#e383a6',
            '#e383c9',
            '#e3a683',
            '#e3a6a6',
            '#e3a6c9',
            '#e3c983',
            '#e3c9a6',
            '#e3c9c9',
            '#83e383',
            '#83e3a6',
            '#83e3c9',
            '#83a683',
            '#83a6a6',
            '#83a6c9',
            '#83c983',
            '#83c9a6',
            '#83c9c9',
            '#a683e3',
            '#a6a6e3',
            '#a6c9e3',
            '#a683e3',
            '#a6a6e3',
            '#a6c9e3',
            '#c983e3',
            '#c9a6e3',
            '#c9c9e3',
        ]
        return colors[level]
    }

</script>

<template>
    <template v-for="(item, key) in data" :key="key">
        <div
            class="tree"
            v-if="item.parent_id == parent"
            :class="{ 'tree--root': level == 0 }"
        >
            <div
                class="tree__title"
                :style="{ backgroundColor: getBgColor(level) }"
            >
                {{ item.name }}
                <template v-if="item.users.length">
                    <br>
                    <small>({{ item.users.map(user => user.name).join(', ') }})</small>
                </template>
            </div>
            <div class="tree__content">
                <Tree
                    :data="data"
                    :parent="item.id"
                    :level="level + 1"
                />
            </div>
        </div>
    </template>
</template>
<style lang="scss" scoped>
    .tree {
        margin-bottom: 8px;
        position: relative;
        &__title {
            border: 1px solid #ccc;
            padding: 8px 15px;
            box-sizing: border-box;
            display: inline-block;
            margin-bottom: 8px;
            border-radius: 0;
            border: none;
            box-shadow: 1px 1px 3px 0px #0000004a;
            position: relative;
            // width: 100%;
            color: #000000e0;
            user-select: none;
            cursor: pointer;
            &:hover {
                // deberia oscurecerse un poco
                filter: brightness(0.9);
            }
            &:active {
                filter: drop-shadow(0 0 0.75rem #0000004a);
            }
            &::before {
                content: "";
                width: 15px;
                height: 1px;
                background-color: #000;
                position: absolute;
                left: -15px;
                top: 17px;
            }
            /*
            &::after {
                content: "";
                width: 1px;
                height: 26px;
                background-color: #000;
                position: absolute;
                left: -15px;
                top: -8px;
            }
            */
            }
        /*
        &::after {
            content: "";
            width: 1px;
            background-color: #000;
            height: 100%;
            position: absolute;
            left: -15px;
        }
        /* si es el ultimo elemento
        &:last-child {
            &::after {
                content: "";
                display: none;
            }
        }
         */
        &__content {
            padding-left: 20px;
            &::before {
                content: "";
                width: 1px;
                background-color: #000;
                height: calc(100% + 9px);
                position: absolute;
                left: -16px;
                top: -8px;
            }
        }
        &:last-child {
            .tree__content::after {
                content: "";
                width: 1px;
                background-color: #ffffff;
                height: 100%;
                position: absolute;
                left: -16px;
                top: 18px;
            }
        }
        &--root {
            background: #FFF;
            box-sizing: border-box;
            padding: 15px;
            border: 1px solid;
            overflow: hidden;
            & > .tree__title {
                /*
                border: none;
                box-shadow: none;
                */
                &::before {
                    display: none;
                }
            }
        }
    }
</style>