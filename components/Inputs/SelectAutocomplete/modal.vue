<template>
    <div class="modal__inner">
        <Dropdown
            :paginator="data.rawData.paginator"
            :state="data.rawData.state"
            :itemConditional="data.rawData.itemConditional"
            :allowNull="data.rawData.allowNull"
            :modalData="data"
        >
            <template #option="option">
                <slot v-bind="option" name="option"></slot>
            </template>
        </Dropdown>
    </div>
</template>

<script setup>
    import Dropdown from './dropdown.vue'
    import { reactive, ref, watch, onMounted, useSlots } from 'vue'

    const props = defineProps({
        data: {
            type: Object,
            required: true,
        }
    })

    const slots = useSlots()
    slots.option = props.data.rawData.slots.option

    const close = () => {
        props.data.callback.reject('Close on overlay click')
    }

</script>


<style lang="scss" scoped>
    .modal__inner {
        position: relative;
        width: calc(100% - 25px);
        height: 340px;
        margin-top: -41px;
        box-sizing: border-box;
    }
</style>