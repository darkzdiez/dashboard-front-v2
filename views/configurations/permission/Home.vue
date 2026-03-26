<template>
    <SectionHeader>
        <template #title>
            <button
                @click="$goBack('/configurations')"
                class="btn-back"
                type="button"
            >
                <i class="fas fa-arrow-left"></i>
            </button>
            <span>Permisos</span>
        </template>
        <template #buttons>
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
            <router-link to="/permission/add" class="btn btn--darkgray">
                <i class="fas fa-plus"></i> Añadir
            </router-link>
        </template>
    </SectionHeader>
    <table>
        <thead>
            <tr>
                <th>Grupo</th>
                <th>Nombre</th>
                <th>Guard</th>
                <th>Descipción</th>
                <th>Roles</th>
                <th>Tipos de Organización</th>
                <th>Acciones</th>
            </tr>
        </thead>
        <tbody>
            <tr class="table__search">
                <td>
                    <input
                        type="text"
                        v-model="pagination.filters.group_prefix"
                        @keyup.enter="pagination.applyFilters"
                    />
                </td>
                <td>
                    <input
                        type="text"
                        v-model="pagination.filters.name"
                        @keyup.enter="pagination.applyFilters"
                    />
                </td>
                <td>
                    <input
                        type="text"
                        v-model="pagination.filters.guard_name"
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
                <td>{{ item.group_prefix }}</td>
                <td>{{ item.name }}</td>
                <td>{{ item.guard_name }}</td>
                <td>{{ item.description }}</td>
                <td>
                    <router-link
                        class="me-5"
                        :to="'/group/' + group.uuid + '/edit'"
                        v-for="(group, gkey) in item.groups"
                        >{{ group.name }}</router-link
                    >
                </td>
                <td>
                    <router-link
                        class="me-5"
                        :to="
                            '/organization-type/' +
                            organization_type.uuid +
                            '/edit'
                        "
                        v-for="(
                            organization_type, gkey
                        ) in item.organization_types"
                        >{{ organization_type.name }}</router-link
                    >
                </td>
                <td>
                    <div class="btns">
                        <router-link
                            :to="'/permission/' + item.uuid + '/edit'"
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
    urlBase: new URL(
        '/api/permission',
        window.public_path || window.location.origin
    ),
    filtersKeys: ['group_prefix', 'name', 'guard_name', 'description'],
    config: {
        cachePrefix: 'shipment',
        deleteEnpoint: window.public_path + '/api/permission/delete/${uuid}',
        restoreEnpoint: window.public_path + '/api/permission/restore/${uuid}',
    },
});

pagination.syncData();
</script>
<style lang="scss" scoped></style>
