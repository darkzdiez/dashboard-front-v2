<template>
    <SectionHeader>
        <template #title>
            Grupos
        </template>
        <template #buttons>
            <router-link
                class="btn btn--yellow"
                to="/configurations"
            >
                <i class="fas fa-arrow-left"></i> Volver
            </router-link>
            <button
                class="btn btn--gray-outline"
                @click="layout = 'list'"
            >
                <i class="fas fa-list"></i> Ver Lista
            </button>
            <button
                class="btn btn--gray-outline"
                @click="layout = 'tree'"
            >
                <i class="fas fa-sitemap"></i> Ver Árbol
            </button>
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
                to="/group/add"
                class="btn btn--green"
            >
                <i class="fas fa-plus"></i> Añadir
            </router-link>
        </template>
    </SectionHeader>
    <template v-if="layout === 'list'">
        <table>
            <thead>
                <tr>
                    <th class="p-0"></th>
                    <th>Nombre</th>
                    <th>Guard</th>
                    <th>Descipción</th>
                    <th>Padre</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                <tr class="table__search">
                    <td><i class="fas fa-search-minus table__icon-search"></i></td>
                    <td><input type="text" v-model="pagination.filters.name" @keyup.enter="pagination.applyFilters" /></td>
                    <td><input type="text" v-model="pagination.filters.guard_name" @keyup.enter="pagination.applyFilters" /></td>
                    <td><input type="text" v-model="pagination.filters.description" @keyup.enter="pagination.applyFilters" /></td>
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
                    <td>{{ item.guard_name }}</td>
                    <td v-html="item.description"></td>
                    <td>{{ item.parent ? item.parent.name : '' }}</td>
                    <td>
                        <div class="btns">
                            <router-link
                                :to="'/group/' + item.uuid + '/edit'"
                                class="btn btn--green"
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
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </template>
    <template v-if="layout === 'tree'">
        <Tree
            :data="pagination.paginator.data"
        />
    </template>
    <Paginator
        :paginator="pagination.paginator"
        @change="pagination.syncData"
    />
</template>

<script setup>
    import { reactive, ref } from 'vue'
    import { useRoute, useRouter } from 'vue-router'
    import Tree from './Tree.vue'
    
    const route = useRoute()
    const router = useRouter()
    const layout = ref('list')
    const pagination = dataPaginator({
        urlBase: new URL(window.public_path + '/api/group'),
        filtersKeys: ['name', 'guard_name', 'description'],
        config: {
            cachePrefix: 'group',
            deleteEnpoint: window.public_path + '/api/group/delete/${uuid}',
            restoreEnpoint: window.public_path + '/api/group/restore/${uuid}',
        }
    })
    pagination.syncData()

</script>
<style lang="scss" scoped>
    
</style>
