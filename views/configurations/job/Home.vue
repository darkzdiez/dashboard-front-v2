<template>
    <Main>
        <SectionHeader>
            <template #title>
                Jobs
            </template>
            <template #buttons>
                <router-link
                    class="btn btn--darkgray-outline"
                    to="/data"
                >
                    <i class="fas fa-arrow-left"></i> Volver
                </router-link>
                <button
                    class="btn btn--gray"
                    @click="pagination.syncData()"
                >
                    <i class="fas fa-sync-alt"></i> Actualizar
                </button>
            </template>
        </SectionHeader>
        <table class="table table--small">
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Usuario</th>
                    <th>Consultas SQL</th>
                    <th>Consultas SQL (Tiempo)</th>
                    <th>Memoria</th>
                    <th>Tiempo de ejecución</th>
                    <th>Fecha</th>
                    <th></th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                <tr class="table__search">
                    <td><input type="text" v-model="pagination.filters.title" @keyup.enter="pagination.applyFilters" /></td>
                    <td><input type="text" v-model="pagination.filters.description" @keyup.enter="pagination.applyFilters" /></td>
                    <td><input type="text" v-model="pagination.filters.status" @keyup.enter="pagination.applyFilters" /></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td>
                        <div class="btns">
                            <button class="btn btn--darkgray" @click="pagination.applyFilters">
                                Buscar <i class="fas fa-search"></i>
                            </button>
                            <button class="btn btn--gray" @click="pagination.clearFilters">
                                <i class="fas fa-eraser"></i>
                            </button>
                        </div>
                    </td>
                </tr>
                <tr v-for="(item, key) in pagination.paginator.data" :key="key">
                    <td>{{ item.title }}</td>
                    <td>{{ item.description }}</td>
                    <td>{{ item.status }}</td>
                    <td>{{ item.user_name }}</td>
                    <td>{{ item.queries_count }}</td>
                    <td>{{ item.queries_time_human }}</td>
                    <td>{{ item.memory_usage_human }}</td>
                    <td>{{ item.time_execution_human }}</td>
                    <td>{{ item.created_at_formatted }}</td>
                    <td>{{ item.created_at_human }}</td>
                    <td>
                        <div class="btns">
                            <button
                                class="btn btn--darkgray"
                                type="button"
                                @click="showJob(item.uuid)"
                            >
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
        <Paginator
            :paginator="pagination.paginator"
            @change="pagination.syncData"
        />
    </Main>
</template>

<script setup>
    import { reactive } from 'vue'
    import { useRoute, useRouter } from 'vue-router'

    const route = useRoute()
    const router = useRouter()

    const pagination = dataPaginator({
        urlBase: new URL(window.public_path + '/api/jobs'),
        filtersKeys: [
            'title',
            'description',
            'status',
            'created_at_formatted',
        ],
        config: {
            cachePrefix: 'jobs',
        }
    })

    pagination.syncData()

    const showJob = (uuid) => {
        console.log(uuid)
    }
</script>
<style lang="scss" scoped>
    
</style>