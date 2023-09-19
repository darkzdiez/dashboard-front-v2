<template>
    <button
        class="btn btn--circle btn--grayred-outline"
        type="submit"
        @click="addNote"
    >
        <i class="far fa-comment-dots"></i>
    </button>
</template>

<script setup>
    import { reactive, ref, watch } from 'vue'
    import { useRoute, useRouter } from 'vue-router'
    import AddNoteComponent from './AddNote.vue'

    const route = useRoute()
    const router = useRouter()

    const props = defineProps({
        area: {
            type: String,
            required: true,
        },
        refid: {
            type: [String, Number],
            required: true,
        },
        title: {
            type: String,
            required: false,
            default: 'Agregar nota',
        },
        useInputTitle: {
            type: Boolean,
            required: false,
            default: false,
        },
        type: {
            type: String,
            required: false,
            default: 'alert',
        },
    })
    const addNote = () => {
        const modal = awesomeModal.open({
            type: 'component',
            component: AddNoteComponent,
            area: props.area,
            refid: props.refid,
            title: props.title,
            useInputTitle: props.useInputTitle,
            typeNote: props.type,
        })
        modal.promise.then((data) => {
            console.log('Dio bien')
            getData()
        })
        /*
        modal.promise.catch((error) => {
            console.log('Dio error')
            getData()
        })
        */
    }
</script>


<style lang="scss" scoped>

</style>