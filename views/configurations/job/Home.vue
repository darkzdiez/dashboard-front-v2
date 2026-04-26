<template>
    <Main>
        <div class="job-page">
            <SectionHeader>
                <template #title> Jobs </template>
                <template #buttons>
                    <button
                        class="btn btn--yellow"
                        @click="handleClearHistory('queue')"
                    >
                        <i class="fas fa-clipboard-list"></i>
                        Borrar trabajos en cola
                    </button>
                    <button
                        class="btn btn--lightblue"
                        @click="handleClearHistory('completed')"
                    >
                        <i class="fas fa-check-circle"></i>
                        Borrar historial
                    </button>
                    <button class="btn btn--red" @click="handleClearHistory('all')">
                        <i class="fas fa-trash-alt"></i>
                        Borrar todos
                    </button>
                    <router-link
                        class="btn btn--darkgray-outline"
                        to="/configurations"
                    >
                        <i class="fas fa-arrow-left"></i> Volver
                    </router-link>
                    <button class="btn btn--gray" @click="pagination.syncData()">
                        <i class="fas fa-sync-alt"></i> Actualizar
                    </button>
                </template>
            </SectionHeader>
            <div class="job-table-wrap">
                <table class="table--small table job-table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Cola</th>
                            <th>Description</th>
                            <th>Status</th>
                            <th>Usuario</th>
                            <th>Consultas SQL</th>
                            <th>Consultas SQL (Tiempo)</th>
                            <th>Memoria</th>
                            <th>Tiempo de ejecución</th>
                            <th>Fecha</th>
                            <th>Iniciado</th>
                            <th>Finalizado</th>
                            <th>Hace</th>
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr class="table__search">
                            <td data-label="Título">
                                <input
                                    type="text"
                                    v-model="pagination.filters.title"
                                    @keyup.enter="pagination.applyFilters"
                                />
                            </td>
                            <td data-label="Cola">
                                <input
                                    type="text"
                                    v-model="pagination.filters.queue"
                                    @keyup.enter="pagination.applyFilters"
                                />
                            </td>
                            <td data-label="Descripción">
                                <input
                                    type="text"
                                    v-model="pagination.filters.description"
                                    @keyup.enter="pagination.applyFilters"
                                />
                            </td>
                            <td data-label="Estado">
                                <select
                                    v-model="pagination.filters.status"
                                    @change="pagination.applyFilters"
                                >
                                    <option value="">Todos</option>
                                    <option value="waiting">waiting</option>
                                    <option value="running">running</option>
                                    <option value="finish">finish</option>
                                    <option value="failed">failed</option>
                                    <option value="cancelled">cancelled</option>
                                </select>
                            </td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td data-label="Filtros">
                                <div class="btns">
                                    <button
                                        class="btn btn--darkgray"
                                        @click="pagination.applyFilters"
                                    >
                                        <i class="fas fa-search"></i>
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
                            <td data-label="Título">{{ item.title }}</td>
                            <td data-label="Cola">{{ item.queue }}</td>
                            <td data-label="Descripción">{{ item.description }}</td>
                            <td data-label="Estado">
                                <a
                                    href="javascript:void(0)"
                                    @click="openCallback(item)"
                                    >{{ item.status }}</a
                                >
                            </td>
                            <td data-label="Usuario">{{ item.user_name }}</td>
                            <td data-label="Consultas SQL">
                                <a
                                    href="javascript:void(0)"
                                    @click="openQueries(item)"
                                    >{{ item.queries_count }}</a
                                >
                            </td>
                            <td data-label="Consultas SQL (Tiempo)">
                                {{ item.queries_time_human }}
                            </td>
                            <td data-label="Memoria">{{ item.memory_usage_human }}</td>
                            <td data-label="Tiempo de ejecución">
                                {{ item.time_execution_human }}
                            </td>
                            <td data-label="Fecha">{{ item.created_at_formatted }}</td>
                            <td data-label="Iniciado">{{ item.started_at_formatted }}</td>
                            <td data-label="Finalizado">
                                {{ item.finished_at_formatted }}
                            </td>
                            <td data-label="Hace">{{ item.created_at_human }}</td>
                            <td data-label="Acción">
                                <button
                                    v-if="item.status === 'waiting'"
                                    class="btn btn--danger btn--sm"
                                    :disabled="cancellingJobUuid === item.uuid"
                                    @click="handleCancelJob(item)"
                                >
                                    <span v-if="cancellingJobUuid === item.uuid"
                                        >Cancelando...</span
                                    >
                                    <span v-else>Cancelar</span>
                                </button>
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
    </Main>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ModalCallback from './ModalCallback.vue';
import ModalQueries from './ModalQueries.vue';

const route = useRoute();
const router = useRouter();

const pagination = dataPaginator({
    urlBase: new URL('/api/jobs', window.public_path || window.location.origin),
    filtersKeys: [
        'title',
        'queue',
        'description',
        'status',
        'created_at_formatted',
    ],
    config: {
        cachePrefix: 'jobs',
    },
});

// pagination.syncData()

pagination.applyFilters({
    prespreserveLastPage: true,
});

const cancellingJobUuid = ref(null);

const historyActions = {
    queue: {
        confirmTitle: 'Borrar historial (en cola)',
        confirmMessage:
            '¿Estás seguro de borrar el historial de trabajos pendientes en cola?',
        successMessage:
            'Historial de trabajos en cola eliminado correctamente.',
        endpointSuffix: 'queue',
    },
    completed: {
        confirmTitle: 'Borrar historial (completados)',
        confirmMessage:
            '¿Estás seguro de borrar el historial de trabajos completados?',
        successMessage:
            'Historial de trabajos completados eliminado correctamente.',
        endpointSuffix: 'completed',
    },
    all: {
        confirmTitle: 'Borrar historial (todos)',
        confirmMessage:
            '¿Estás seguro de borrar el historial de todos los trabajos?',
        successMessage: 'Historial de trabajos eliminado completamente.',
        endpointSuffix: 'all',
    },
};

const handleClearHistory = (scope) => {
    const action = historyActions[scope] || historyActions.all;

    awesomeModal
        .confirm(action.confirmTitle, action.confirmMessage)
        .then((confirmed) => {
            if (!confirmed) {
                return;
            }

            const loadingModal = awesomeModal.loading('Borrando historial');

            httpRequest({
                url:
                    window.public_path +
                    '/api/jobs/history/' +
                    action.endpointSuffix,
                method: 'DELETE',
            })
                .then(() => {
                    loadingModal.close();
                    awesomeModal
                        .success('Completado', action.successMessage)
                        .promise.finally(() => {
                            pagination.applyFilters({
                                prespreserveLastPage: true,
                            });
                        });
                })
                .catch(() => {
                    loadingModal.close();
                    awesomeModal.error(
                        'Error',
                        'No se pudo borrar el historial. Intenta nuevamente.'
                    );
                });
        })
        .catch(() => {});
};

const handleCancelJob = (item) => {
    awesomeModal
        .confirm(
            'Cancelar job',
            `¿Estás seguro de cancelar "${item.title || 'este job'}"?`
        )
        .then((confirmed) => {
            if (!confirmed || cancellingJobUuid.value) {
                return;
            }

            const loadingModal = awesomeModal.loading('Cancelando job');
            cancellingJobUuid.value = item.uuid;

            httpRequest({
                url: window.public_path + '/api/jobs/' + item.uuid + '/cancel',
                method: 'DELETE',
            })
                .then(() => {
                    loadingModal.close();
                    awesomeModal
                        .success(
                            'Completado',
                            'El job fue cancelado correctamente.'
                        )
                        .promise.finally(() => {
                            pagination.applyFilters({
                                prespreserveLastPage: true,
                            });
                        });
                })
                .catch(() => {
                    loadingModal.close();
                    awesomeModal.error(
                        'Error',
                        'No se pudo cancelar el job. Intenta nuevamente.'
                    );
                })
                .finally(() => {
                    cancellingJobUuid.value = null;
                });
        })
        .catch(() => {});
};

const openCallback = (item) => {
    let modal = awesomeModal.loading();
    httpRequest({
        url: window.public_path + '/api/jobs/' + item.uuid + '/callback',
        method: 'GET',
    })
        .then((data) => {
            modal.close();
            awesomeModal
                .open({
                    type: 'component',
                    component: ModalCallback,
                    preventClose: true,
                    jobCallback: data,
                })
                .promise.then((message) => {});
        })
        .catch((error) => {
            modal.close();
        });
};

const openQueries = (item) => {
    let modal = awesomeModal.loading();
    httpRequest({
        url: window.public_path + '/api/jobs/' + item.uuid + '/queries',
        method: 'GET',
    })
        .then((data) => {
            modal.close();
            awesomeModal
                .open({
                    type: 'component',
                    component: ModalQueries,
                    preventClose: true,
                    jobQueries: data,
                })
                .promise.then((message) => {});
        })
        .catch((error) => {
            modal.close();
        });
};
</script>
<style lang="scss" scoped>
.job-table-wrap {
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
}

.job-table {
    min-width: 1280px;
}

.job-table a {
    overflow-wrap: anywhere;
}

@media (max-width: 768px) {
    .job-table-wrap {
        overflow: visible;
    }

    .job-table {
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
            grid-template-columns: minmax(124px, 42%) minmax(0, 1fr);
            gap: 10px;
            align-items: center;
            padding: 10px 12px;
            border: 0;
            border-bottom: 1px solid #eef0f1;
            line-height: 1.35;
            text-align: left;
            white-space: normal;
            overflow-wrap: anywhere;

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

                input,
                select {
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

        .btn--danger {
            width: 100%;
            min-height: 38px;
            white-space: normal;
        }
    }
}
</style>
