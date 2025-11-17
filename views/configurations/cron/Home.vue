<template>
    <SectionHeader>
        <template #title> Tareas CRON </template>
        <template #buttons>
            <router-link class="btn btn--yellow" to="/configurations">
                <i class="fas fa-arrow-left"></i> Volver
            </router-link>
            <button class="btn btn--gray" @click="pagination.syncData()">
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

            <router-link to="/cron/add" class="btn btn--green">
                <i class="fas fa-plus"></i> Añadir
            </router-link>
        </template>
    </SectionHeader>
    <table>
        <thead>
            <tr>
                <th class="p-0"></th>
                <th>Descripción</th>
                <th>Metodo</th>
                <th>Comando</th>
                <th></th>
                <th>Acciones</th>
            </tr>
        </thead>
        <tbody>
            <tr class="table__search">
                <td><i class="fas fa-search-minus table__icon-search"></i></td>
                <td>
                    <input
                        type="text"
                        v-model="pagination.filters.description"
                        @keyup.enter="pagination.applyFilters"
                    />
                </td>
                <td>
                    <input
                        type="text"
                        v-model="pagination.filters.method"
                        @keyup.enter="pagination.applyFilters"
                    />
                </td>
                <td>
                    <input
                        type="text"
                        v-model="pagination.filters.command"
                        @keyup.enter="pagination.applyFilters"
                    />
                </td>
                <td></td>
                <td>
                    <div class="btns">
                        <button
                            class="btn btn--green"
                            @click="pagination.applyFilters"
                        >
                            Buscar <i class="fas fa-search"></i>
                        </button>
                        <button
                            class="btn btn--gray"
                            @click="pagination.clearFilters"
                        >
                            <i class="fas fa-eraser"></i>
                        </button>
                    </div>
                </td>
            </tr>
            <tr v-for="(item, key) in pagination.paginator.data" :key="key">
                <td class="p-0"></td>
                <td>{{ item.description }}</td>
                <td>{{ item.method }}</td>
                <td>{{ item.command }}</td>
                <td class="nowrap">
                    {{ item.minute }} {{ item.hour }} {{ item.day }}
                    {{ item.month }} {{ item.day_of_week }}
                </td>
                <td>
                    <div class="btns">
                        <router-link
                            :to="'/cron/' + item.uuid + '/edit'"
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
    <Paginator
        :paginator="pagination.paginator"
        @change="pagination.syncData"
    />
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const pagination = dataPaginator({
    urlBase: new URL(window.public_path + '/api/cron'),
    filtersKeys: ['name', 'guard_name', 'description'],
    config: {
        cachePrefix: 'cron',
        deleteEnpoint: window.public_path + '/api/cron/delete/${uuid}',
        restoreEnpoint: window.public_path + '/api/cron/restore/${uuid}',
    },
});
pagination.syncData();
</script>
<style lang="scss" scoped></style>
