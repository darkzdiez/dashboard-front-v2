<template>
    <div class="cron-page">
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
        <div class="cron-table-wrap">
            <table class="cron-table">
                <thead>
                    <tr>
                        <th class="p-0"></th>
                        <th>Descripción</th>
                        <th>Método</th>
                        <th>Comando</th>
                        <th>Programación</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="table__search">
                        <td class="p-0">
                            <i class="fas fa-search-minus table__icon-search"></i>
                        </td>
                        <td data-label="Descripción">
                            <input
                                type="text"
                                v-model="pagination.filters.description"
                                @keyup.enter="pagination.applyFilters"
                            />
                        </td>
                        <td data-label="Método">
                            <input
                                type="text"
                                v-model="pagination.filters.method"
                                @keyup.enter="pagination.applyFilters"
                            />
                        </td>
                        <td data-label="Comando">
                            <input
                                type="text"
                                v-model="pagination.filters.command"
                                @keyup.enter="pagination.applyFilters"
                            />
                        </td>
                        <td></td>
                        <td data-label="Filtros">
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
                        <td data-label="Descripción">{{ item.description }}</td>
                        <td data-label="Método">{{ item.method }}</td>
                        <td data-label="Comando">{{ item.command }}</td>
                        <td class="nowrap" data-label="Programación">
                            {{ item.minute }} {{ item.hour }} {{ item.day }}
                            {{ item.month }} {{ item.day_of_week }}
                        </td>
                        <td data-label="Acciones">
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
        </div>
        <Paginator
            :paginator="pagination.paginator"
            @change="pagination.syncData"
        />
    </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const pagination = dataPaginator({
    urlBase: new URL('/api/cron', window.public_path || window.location.origin),
    filtersKeys: ['name', 'guard_name', 'description'],
    config: {
        cachePrefix: 'cron',
        deleteEnpoint: window.public_path + '/api/cron/delete/${uuid}',
        restoreEnpoint: window.public_path + '/api/cron/restore/${uuid}',
    },
});
pagination.syncData();
</script>
<style lang="scss" scoped>
.cron-table-wrap {
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
}

.cron-table {
    min-width: 760px;
}

@media (max-width: 768px) {
    .cron-table-wrap {
        overflow: visible;
    }

    .cron-table {
        display: block;
        min-width: 0;
        border: 0;

        thead {
            display: none;
        }

        tbody {
            display: grid;
            gap: 12px;
        }

        tr {
            display: block;
            overflow: hidden;
            border: 1px solid #dadddf;
            border-radius: 8px;
            background: #ffffff;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
        }

        td {
            display: grid;
            grid-template-columns: minmax(104px, 38%) minmax(0, 1fr);
            gap: 10px;
            align-items: center;
            padding: 10px 12px;
            border: 0;
            border-bottom: 1px solid #eef0f1;
            line-height: 1.35;
            text-align: left;
            white-space: normal;

            &::before {
                content: attr(data-label);
                color: #656565;
                font-size: 12px;
                font-weight: 600;
                line-height: 1.25;
            }

            &:last-child {
                border-bottom: 0;
            }
        }

        td.p-0,
        td:empty {
            display: none;
        }

        .table__search {
            display: grid;
            gap: 10px;
            padding: 12px;

            td {
                display: grid;
                grid-template-columns: 1fr;
                gap: 6px;
                padding: 0 !important;
                border: 0;

                input {
                    min-height: 38px;
                    border: 1px solid #dadddf;
                    border-radius: 6px;
                }
            }

            td[data-label='Filtros']::before {
                display: none;
            }
        }

        .btns {
            justify-content: flex-start;
            width: 100%;
            max-width: none;
            margin-left: 0;
            padding: 0 !important;

            .btn {
                flex: 1 1 0;
                min-height: 38px;
            }
        }
    }
}
</style>
