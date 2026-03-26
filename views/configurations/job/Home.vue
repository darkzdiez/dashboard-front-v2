<template>
    <Main>
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
        <table class="table--small table">
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
                    <th></th>
                </tr>
            </thead>
            <tbody>
                <tr class="table__search">
                    <td>
                        <input
                            type="text"
                            v-model="pagination.filters.title"
                            @keyup.enter="pagination.applyFilters"
                        />
                    </td>
                    <td>
                        <input
                            type="text"
                            v-model="pagination.filters.queue"
                            @keyup.enter="pagination.applyFilters"
                        />
                    </td>
                    <td>
                        <input
                            type="text"
                            v-model="pagination.filters.description"
                            @keyup.enter="pagination.applyFilters"
                        />
                    </td>
                    <td>
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
                    <td>
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
                    <td>{{ item.title }}</td>
                    <td>{{ item.queue }}</td>
                    <td>{{ item.description }}</td>
                    <td>
                        <a
                            href="javascript:void(0)"
                            @click="openCallback(item)"
                            >{{ item.status }}</a
                        >
                    </td>
                    <td>{{ item.user_name }}</td>
                    <td>
                        <a
                            href="javascript:void(0)"
                            @click="openQueries(item)"
                            >{{ item.queries_count }}</a
                        >
                    </td>
                    <td>{{ item.queries_time_human }}</td>
                    <td>{{ item.memory_usage_human }}</td>
                    <td>{{ item.time_execution_human }}</td>
                    <td>{{ item.created_at_formatted }}</td>
                    <td>{{ item.started_at_formatted }}</td>
                    <td>{{ item.finished_at_formatted }}</td>
                    <td>{{ item.created_at_human }}</td>
                    <td>
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
        <Paginator
            :paginator="pagination.paginator"
            @change="pagination.syncData"
        />
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
<style lang="scss" scoped></style>
