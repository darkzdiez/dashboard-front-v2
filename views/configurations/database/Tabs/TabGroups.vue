<template>
    <div class="grid-1 grid-md-2 grid-lg-2 gap-15">
        <fieldset v-for="group in groups" :key="group.id">
            <legend>
                {{ group.name }}
                <button
                    @click="editGroup(group)"
                >
                    <i class="fas fa-edit"></i>
                </button>
                <button
                    @click="deleteGroup(group)"
                >
                    <i class="fas fa-trash"></i>
                </button>
                <button
                >
                    <i class="fas fa-database"></i>
                </button>
                <button
                    @click="generateSeeder(group)"
                >
                    <i class="fas fa-seedling"></i>
                </button>
                <button
                    @click="executeSeeder(group)"
                >
                    <i class="fas fa-play"></i>
                    Ejecutar Seeder
                </button>
            </legend>
            <div v-if="group.tables" class="grid-1 grid-md-2 grid-lg-3 gap-15">
                <div v-for="table in group.tables" class="input-group">
                    <label>{{ table }}</label>
                    <button
                        class="btn btn--small btn--red"
                        @click="removeTable(group.id, table)"
                    >
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <form @submit.prevent="addTable" class="d-flex align-items-end mt-25">
                <input type="hidden" name="group_id" :value="group.id">
                <label>
                    <span>Añadir una Tabla:</span>
                    <select
                        class="form-control"
                        name="table"
                    >
                        <option value="">Seleccione una tabla</option>
                        <template v-for="table in tables">
                            <option :value="table" v-if="group.tables == null || !group.tables.includes(table)">{{ table }}</option>
                        </template>
                    </select>
                </label>
                <button
                    class="btn btn--green btn--small"
                    type="submit"
                >
                    <i class="fas fa-plus"></i> Añadir
                </button>
            </form>
        </fieldset>
    </div>
    <form @submit.prevent="storeGroup" class="d-flex align-items-end mt-25" style="max-width: 350px; margin: auto;">
        <label>
            <span>Añadir un Grupo:</span>
            <input
                type="text"
                class="form-control"
                placeholder="Nombre"
                name="name"
            >
        </label>
        <button
            class="btn btn--green btn--small"
            type="submit"
        >
            <i class="fas fa-plus"></i> Añadir
        </button>
    </form>
</template>

<script setup>
    import { reactive, ref, watch, watchEffect } from 'vue'
    import { useRoute, useRouter } from 'vue-router'
    import EditGroupComponent from './EditGroupComponent.vue'

    const route = useRoute()
    const router = useRouter()

    const tables = reactive([])
    const getTables = () => {
        httpRequest({
            url: window.public_path + '/api/database/tables',
            method: 'GET',
        })
        .then((data) => {
            tables.push(...data)
        })
        .catch((error) => {
        })
    }
    getTables()

    const groups = reactive([])
    const getGroups = () => {
        // limpiar el array
        groups.splice(0, groups.length)
        httpRequest({
            url: window.public_path + '/api/database/groups',
            method: 'GET',
        })
        .then((data) => {
            groups.push(...data)
        })
        .catch((error) => {})
    }
    getGroups()

    const storeGroup = (form) => {
        window.awesomeModal.loading()
        const formData = new FormData()
        formData.append('name', form.srcElement.name.value)

        httpRequest({
            url: window.public_path + '/api/database/groups',
            method: 'POST',
            data: formData,
        })
        .then((data) => {
            window.awesomeModal.closeAll()
            window.awesomeModal.alert('Grupo añadido', 'El grupo ha sido añadido correctamente')
            form.srcElement.name.value = ''
            getGroups()
        })
        .catch((error) => {
            window.awesomeModal.closeAll()
            if (error.response.status === 422) {
                errors.name = error.response.data.errors.name
            }
        })
    }

    const addTable = (form) => {
        window.awesomeModal.loading()
        const formData = new FormData()
        formData.append('group_id', form.srcElement.group_id.value)
        formData.append('table', form.srcElement.table.value)

        httpRequest({
            url: window.public_path + '/api/database/group/table/add',
            method: 'POST',
            data: formData,
        })
        .then((data) => {
            window.awesomeModal.closeAll()
            window.awesomeModal.alert('Tabla añadida', 'La tabla ha sido añadida correctamente')
            form.srcElement.table.value = ''
            getGroups()
        })
        .catch((error) => {
            window.awesomeModal.closeAll()
            if (error.response.status === 422) {
                errors.name = error.response.data.errors.name
            }
        })
    }

    const removeTable = (group_id, table) => {
        window.awesomeModal.confirm(
            '¿Está seguro?',
            '¿Está seguro que desea eliminar la tabla ' + table + ' del grupo ' + groups.find(group => group.id == group_id).name + '?',
        ).then((result) => {
            if (result) {
                window.awesomeModal.loading()
                const formData = new FormData()
                formData.append('group_id', group_id)
                formData.append('table', table)

                httpRequest({
                    url: window.public_path + '/api/database/group/table/remove',
                    method: 'POST',
                    data: formData,
                })
                .then((data) => {
                    window.awesomeModal.closeAll()
                    window.awesomeModal.alert('Tabla eliminada', 'La tabla ha sido eliminada correctamente')
                    getGroups()
                })
                .catch((error) => {
                    window.awesomeModal.closeAll()
                    if (error.response.status === 422) {
                        errors.name = error.response.data.errors.name
                    }
                })
            }
        })
    }

    const editGroup = (group) => {
        const modal = awesomeModal.open({
            type: 'component',
            component: EditGroupComponent,
            group: group,
        })
        modal.promise.then((data) => {
            // console.log('Dio bien')
            getGroups()
        })
        modal.promise.catch((error) => {
            // console.log('Dio error')
        })
    }

    const deleteGroup = (group) => {
        window.awesomeModal.confirm(
            '¿Está seguro?',
            '¿Está seguro que desea eliminar el grupo ' + group.name + '?',
        ).then((result) => {
            if (result) {
                window.awesomeModal.loading()
                const formData = new FormData()
                formData.append('group_id', group.id)

                httpRequest({
                    url: window.public_path + '/api/database/group/delete',
                    method: 'POST',
                    data: formData,
                })
                .then((data) => {
                    window.awesomeModal.closeAll()
                    window.awesomeModal.alert('Grupo eliminado', 'El grupo ha sido eliminado correctamente')
                    getGroups()
                })
                .catch((error) => {
                    window.awesomeModal.closeAll()
                    if (error.response.status === 422) {
                        errors.name = error.response.data.errors.name
                    }
                })
            }
        })
    }


    const generateSeeder = (group) => {
        window.awesomeModal.confirm('Generar seeder', '¿Está seguro de generar el seeder del grupo ' + group.name + '?')
            .then(value => {
                if (value) {
                    window.awesomeModal.loading()
                    const formData = new FormData()
                    formData.append('group_id', group.id)

                    httpRequest({
                        url: window.public_path + '/api/database/group/seeders/generate',
                        method: 'POST',
                        data: formData,
                    })
                    .then((data) => {
                        window.awesomeModal.closeAll()
                        window.awesomeModal.alert('Seeder generado', 'El seeder del grupo ' + group.name + ' ha sido generado correctamente')
                    })
                    .catch((error) => {
                        window.awesomeModal.closeAll()
                        window.awesomeModal.alert('Error', 'Ha ocurrido un error al generar el seeder del grupo ' + group.name)
                    })
                }
            })
    }
    const executeSeeder = (group) => {
        window.awesomeModal.confirm('Ejecutar seeder', '¿Está seguro de ejecutar el seeder del grupo ' + group.name + '?')
            .then(value => {
                if (value) {
                    window.awesomeModal.loading()
                    const formData = new FormData()
                    formData.append('group_id', group.id)

                    httpRequest({
                        url: window.public_path + '/api/database/group/seeders/execute',
                        method: 'POST',
                        data: formData,
                    })
                    .then((data) => {
                        window.awesomeModal.closeAll()
                        window.awesomeModal.alert('Seeder ejecutado', 'El seeder del grupo ' + group.name + ' ha sido ejecutado correctamente')
                    })
                    .catch((error) => {
                        window.awesomeModal.closeAll()
                        window.awesomeModal.alert('Error', 'Ha ocurrido un error al ejecutar el seeder del grupo ' + group.name)
                    })
                }
            })
    }
</script>
<style lang="scss" scoped>
legend {
    background-color: #000;
    color: #fff;
    padding: 3px 6px;
}
.input-group {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 15px;
    border-radius: 5px;
    background-color: #fff;
    box-shadow: 0 0 5px rgba(0,0,0,.1);
    label {
        padding: 0 15px;
        flex: 1;
        overflow: hidden;
        white-space: nowrap;
        font-size: 13px;
    }
}
</style>
