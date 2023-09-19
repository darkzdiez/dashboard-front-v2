<template>
    <div class="modal-item" v-if="data">
        <div class="modal-item__overlay" @click.self="data.overlayClick">
            <AlertItem v-if="data.type == 'loading' || data.type == 'alert' || data.type == 'confirm'" :data="data"></AlertItem>
            <CustomComponent v-if="data.type == 'component'" :data="data"></CustomComponent>
        </div>
    </div>
</template>

<script setup>
    import AlertItem from './AlertItem.vue'
    import CustomComponent from './CustomComponent.vue'
    const props = defineProps({
        data: {
            type: [Object, Boolean],
            required: true,
            default: null,
        }
    })

</script>


<style lang="scss" scoped>
    .modal-item {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        &__overlay {
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
        }
    }
</style>