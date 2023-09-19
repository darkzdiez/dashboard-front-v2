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
        }
    })

    const notes = reactive([])

    const getData = () => {
        let modal = awesomeModal.loading()
        httpRequest({
            url: window.public_path + '/api/notes/' + props.area + '/' + props.refid,
            method: 'GET',
        })
        .then((data) => {
            // limpiar el array
            notes.splice(0, notes.length)
            // agregar los nuevos datos
            notes.push(...data)
            modal.close()
        })
        .catch((error) => {
            modal.close()
        })
    }
    getData()

    watch(() => props.refid, (newValue, oldValue) => {
        getData()
    })
    const addNote = () => {
        const modal = awesomeModal.open({
            type: 'component',
            component: AddNoteComponent,
            area: props.area,
            refid: props.refid,
            title: 'Agregar nota',
            useInputTitle: true,
            typeNote: 'note',
        })
        modal.promise.then((data) => {
            console.log('Dio bien')
            getData()
        })
        modal.promise.catch((error) => {
            console.log('Dio error')
            getData()
        })
    }

    const deleteNote = (id) => {
        if (confirm('¿Está seguro de eliminar este registro?')) {
            httpRequest({
                url: window.public_path + '/api/notes/' + id + '/delete',
                method: 'POST'
            })
            .then((data) => {
                getData()
            })
            .catch((error) => {})
        }
    }

    const showNote = (id) => {
        const modal = awesomeModal.open({
            type: 'component',
            component: AddNoteComponent,
            area: props.area,
            refid: props.refid,
            id: id,
            title: 'Nota',
            useInputTitle: true,
            typeNote: 'note',
        })
        modal.promise.then((data) => {
            console.log('Dio bien')
            getData()
        })
        modal.promise.catch((error) => {
            console.log('Dio error')
            getData()
        })
    }

    /*
    httpRequest({
        url: window.public_path + '/api/tipo-de-contribuyente/list-select',
        method: 'POST',
    })
    .then((data) => {
        tipoDeContribuyente.push(...data)
        getRows()
    })
    .catch((error) => {
        modal.close()
    })

    const onSubmit = () => {
        let modal = awesomeModal.loading()
        const form_data = new FormData()
        form_data.append("obra_id", route.params.id);
        form_data.append("rows", JSON.stringify(rows));

        httpRequest({
            url: window.public_path + '/api/obra/datos-facturacion/store',
            method: 'POST',
            data: form_data,
        })
        .then((data) => {
            modal.close()
            getRows()
            // awesomeModal.success('Datos de facturación actualizados correctamente')
            editMode.value = false
        })
        .catch((error) => {
            modal.close()
            awesomeModal.error('Error al actualizar los datos de facturación')
        })
    }
*/
</script>
<template>
    <form @submit.prevent="onSubmit" class="overflow-x-auto">
        <div class="form-box__header">
            <h3 class="m-0">Notas</h3>
            <div class="form-box__buttons">
                <button
                    class="btn btn--small btn--green"
                    @click.prevent="addNote"
                >
                    <i class="fas fa-plus"></i> Añadir Nota
                </button>
            </div>
        </div>
        <div class="grid-1 gap-15">
            <table class="table table--small col-1">
                <tbody>
                    <tr v-for="note in notes">
                        <td><small>{{ note?.user?.name }}:</small> {{ note.title }} <small>- {{ note.created_at_human }}</small></td>
                        <td style="width: 0; padding: 3px 0;">
                            <div class="table__btns">
                                <button
                                    class="btn btn--ligthgray"
                                    type="button"
                                    @click="showNote(note.id)"
                                >
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button
                                    class="btn btn--red"
                                    type="button"
                                    @click="deleteNote(note.id)"
                                >
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </form>
</template>


<style lang="scss" scoped>
form {
    padding: 40px 24px;
    background-color: #fff;
    margin-bottom: 20px;
}
</style>