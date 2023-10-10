<template>
    <SectionHeader>
        <template #title>
            Usuarios
        </template>
        <template #buttons>
            <router-link
                class="btn btn--yellow"
                to="/configurations"
            >
                <i class="fas fa-arrow-left"></i> Volver
            </router-link>
            <button
                class="btn btn--gray"
                @click="pagination.syncData()"
            >
                <i class="fas fa-sync-alt"></i> Actualizar
            </button>
            <button
                class="btn btn--darkgray-outline"
                @click="pagination.trash.value = true"
                v-if="!pagination.trash.value"
            >
                <i class="fas fa-trash-alt"></i> Papelera
            </button>
            <button
                class="btn btn--darkgray-outline"
                @click="pagination.trash.value = false"
                v-if="pagination.trash.value"
            >
                <i class="fas fa-undo"></i>
                Salir de la Papelera
            </button>
            <router-link
                to="/user/add"
                class="btn btn--green"
            >
                <i class="fas fa-plus"></i> Añadir
            </router-link>
        </template>
    </SectionHeader>
    <table>
        <thead>
            <tr>
                <th class="p-0"></th>
                <th>Nombre</th>
                <th>Nombre de Usuario</th>
                <th>Email</th>
                <th>Entorno</th>
                <th>Acciones</th>
            </tr>
        </thead>
        <tbody>
            <tr class="table__search">
                <td><i class="fas fa-search-minus table__icon-search"></i></td>
                <td><input type="text" v-model="pagination.filters.name" @keyup.enter="pagination.applyFilters" /></td>
                <td><input type="text" v-model="pagination.filters.username" @keyup.enter="pagination.applyFilters" /></td>
                <td><input type="text" v-model="pagination.filters.email" @keyup.enter="pagination.applyFilters" /></td>
                <td></td>
                <td>
                    <div class="btns">
                        <button class="btn btn--green" @click="pagination.applyFilters">
                            Buscar <i class="fas fa-search"></i>
                        </button>
                        <button class="btn btn--gray" @click="pagination.clearFilters">
                            <i class="fas fa-eraser"></i>
                        </button>
                    </div>
                </td>
            </tr>
            <tr v-for="(item, key) in pagination.paginator.data" :key="key">
                <td class="p-0"></td>
                <td>{{ item.name }}</td>
                <td>{{ item.username }}</td>
                <td>{{ item.email }}</td>
                <td>{{ item.environment }}</td>
                <td>
                    <div class="btns">
                        <router-link
                            :to="'/user/' + item.uuid + '/edit'"
                            class="btn btn--darkgray"
                        >
                            <i class="fas fa-edit"></i>
                        </router-link>
                        <button
                            class="btn btn--gray"
                            @click="item.deleteItem"
                            v-if="!pagination.trash.value"
                        >
                            <i class="fas fa-trash"></i>
                        </button>
                        <button
                            class="btn btn--gray"
                            @click="item.restoreItem"
                            v-else
                        >
                            <i class="fas fa-trash-restore"></i>
                        </button>
                        <button
                            class="btn btn--gray"
                            @click="loginAs(item.id)"
                            v-if="userCan('login-as')"
                        >
                            <i class="fas fa-sign-in-alt"></i>
                        </button>
                    </div>
                </td>
            </tr>
        </tbody>
    </table>
</template>

<script setup>
    import { reactive } from 'vue'
    import { useRoute, useRouter } from 'vue-router'

    const route = useRoute()
    const router = useRouter()

    const paginator = reactive({})

    const pagination = dataPaginator({
        urlBase: new URL(window.public_path + '/api/user'),
        filtersKeys: ['name', 'username', 'email'],
        config: {
            cachePrefix: 'user',
            deleteEnpoint: window.public_path + '/api/user/delete/${uuid}',
            restoreEnpoint: window.public_path + '/api/user/restore/${uuid}',
        }
    })
    pagination.syncData()

    const loginAs = (id) => {
        window.awesomeModal.confirm(
            '¿Está seguro?',
            '¿Está seguro que desea ingresar como este usuario?',
        ).then((result) => {
            if (result) {
                let modal = awesomeModal.loading()
                let form_data = new FormData();

                form_data.append('target_id', id)

                httpRequest({
                    url: window.public_path + '/api/user/login-as',
                    method: 'POST',
                    data: form_data
                })
                .then((data) => {
                    modal.close()
                    window.location.href = window.public_path
                })
                .catch((error) => {
                    modal.close()
                    console.log(error)
                })
            }
        })

    }
</script>
<style lang="scss" scoped>
    
</style>