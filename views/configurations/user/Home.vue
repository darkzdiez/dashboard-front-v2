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
            <span>Usuarios</span>
        </template>
        <template #buttons>
            <MultipleSelectionRecordsButtons
                :table-id="tableId"
                selection-key="uuid"
            >
                <template
                    #selected="{
                        selectedItems,
                        selectionCount,
                        disableSelection,
                        clearSelection,
                    }"
                >
                    <button
                        class="btn btn--primary"
                        type="button"
                        @click="resetPasswordMultiple(selectedItems)"
                    >
                        <i class="fas fa-key"></i>
                        Restablecer contraseña ({{ selectionCount }})
                    </button>
                    <button
                        class="btn btn--gray"
                        type="button"
                        @click="clearSelection"
                    >
                        Limpiar selección
                    </button>
                    <button
                        class="btn btn--gray"
                        type="button"
                        @click="disableSelection"
                    >
                        Cerrar
                    </button>
                </template>
                <template #selecting="{ disableSelection }">
                    <button
                        class="btn btn--gray"
                        type="button"
                        @click="disableSelection"
                    >
                        Cancelar selección
                    </button>
                </template>
                <template #notSelecting="{ enableSelection }">
                    <button
                        class="btn btn--gray"
                        type="button"
                        @click="enableSelection"
                    >
                        Selección múltiple
                    </button>
                </template>
            </MultipleSelectionRecordsButtons>
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
            <router-link to="/user/add" class="btn btn--primary">
                <i class="fas fa-plus"></i> Añadir
            </router-link>
        </template>
    </SectionHeader>
    <table>
        <thead>
            <tr>
                <th class="p-0 table__checkbox">
                    <input
                        v-if="isSelecting"
                        type="checkbox"
                        :checked="allVisibleSelected"
                        :indeterminate="isIndeterminate"
                        @change="toggleSelectAll($event.target.checked)"
                    />
                </th>
                <th>Nombre</th>
                <th>Nombre de Usuario</th>
                <th>Email</th>
                <th>Roles</th>
                <th>Entorno</th>
                <th>Organización</th>
                <th>Login Pass</th>
                <th>Login Google</th>
                <th>Testing</th>
                <th>Production</th>
                <th>Acciones</th>
            </tr>
        </thead>
        <tbody>
            <tr class="table__search">
                <td><i class="fas fa-search-minus table__icon-search"></i></td>
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
                        v-model="pagination.filters.username"
                        @keyup.enter="pagination.applyFilters"
                    />
                </td>
                <td>
                    <input
                        type="text"
                        v-model="pagination.filters.email"
                        @keyup.enter="pagination.applyFilters"
                    />
                </td>
                <td>
                    <select
                        v-model="pagination.filters.group_uuid"
                        @change="pagination.applyFilters()"
                    >
                        <option value="">Todos</option>
                        <option
                            v-for="group in groupOptions"
                            :key="group.uuid"
                            :value="group.uuid"
                        >
                            {{ group.name }}
                        </option>
                    </select>
                </td>
                <td></td>
                <td>
                    <select
                        v-model="pagination.filters.organization_uuid"
                        @change="pagination.applyFilters()"
                    >
                        <option value="">Todas</option>
                        <option
                            v-for="organization in organizationOptions"
                            :key="organization.uuid"
                            :value="organization.uuid"
                        >
                            {{ organization.name }}
                        </option>
                    </select>
                </td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td>
                    <div class="btns">
                        <button
                            class="btn btn--primary"
                            @click="pagination.applyFilters()"
                        >
                            <i class="fas fa-search"></i>
                        </button>
                        <button class="btn btn--gray" @click="clearFilters">
                            <i class="fas fa-eraser"></i>
                        </button>
                    </div>
                </td>
            </tr>
            <tr v-for="(item, key) in pagination.paginator.data" :key="key">
                <td class="p-0 table__checkbox">
                    <input
                        v-if="isSelecting"
                        type="checkbox"
                        :checked="isRecordSelected(item)"
                        @change="toggleRecordSelection(item)"
                    />
                </td>
                <td>{{ item.name }}</td>
                <td>{{ item.username }}</td>
                <td>{{ item.email }}</td>
                <!--<td>{{ item.groups.map((group) => group.name).join(', ') }}</td>-->
                <td>
                    <router-link
                        class="me-5"
                        :to="'/group/' + group.uuid + '/edit'"
                        v-for="(group, gkey) in item.groups"
                        >{{ group.name }}</router-link
                    >
                </td>
                <td>{{ item.environment }}</td>
                <td>
                    <router-link
                        :to="
                            '/organization/' + item.organization?.uuid + '/edit'
                        "
                        >{{ item.organization?.name }}</router-link
                    >
                </td>
                <td class="text-center">
                    <i
                        class="fas"
                        :class="
                            item.login_with_password
                                ? 'fa-check text-success'
                                : 'fa-times text-danger'
                        "
                    ></i>
                </td>
                <td class="text-center">
                    <i
                        class="fas"
                        :class="
                            item.login_with_google
                                ? 'fa-check text-success'
                                : 'fa-times text-danger'
                        "
                    ></i>
                </td>
                <td class="text-center">
                    <i
                        class="fas"
                        :class="
                            item.access_testing
                                ? 'fa-check text-success'
                                : 'fa-times text-danger'
                        "
                    ></i>
                </td>
                <td class="text-center">
                    <i
                        class="fas"
                        :class="
                            item.access_production
                                ? 'fa-check text-success'
                                : 'fa-times text-danger'
                        "
                    ></i>
                </td>
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
                            @click="loginAs(item.uuid)"
                            v-if="userCan('login-as')"
                        >
                            <i class="fas fa-sign-in-alt"></i>
                        </button>
                        <button
                            class="btn btn--darkgray"
                            @click="
                                showModalActivityLogTimeline(
                                    'users',
                                    item.uuid,
                                    'table'
                                )
                            "
                        >
                            <i class="fas fa-history"></i>
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
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { showModalActivityLogTimeline } from 'guachiman-activity-log';
import MultipleSelectionRecordsButtons from '@/components/MultipleSelectionRecordsButtons.vue';
import { useMultipleSelectionRecords } from '@/composables/useMultipleSelectionRecords';

const route = useRoute();
const tableId = 'configurations:user';

const pagination = dataPaginator({
    urlBase: new URL(window.public_path + '/api/user'),
    filtersKeys: [
        'name',
        'username',
        'email',
        'group_uuid',
        'organization_uuid',
    ],
    config: {
        cachePrefix: 'user',
        deleteEnpoint: window.public_path + '/api/user/delete/${uuid}',
        restoreEnpoint: window.public_path + '/api/user/restore/${uuid}',
    },
});
if (pagination.filters.group_uuid == null) {
    pagination.filters.group_uuid = '';
}
if (pagination.filters.organization_uuid == null) {
    pagination.filters.organization_uuid = '';
}

const groupOptions = ref([]);
const organizationOptions = ref([]);

const toArray = (payload) => {
    if (!payload) {
        return [];
    }
    if (Array.isArray(payload)) {
        return payload;
    }
    if (payload.data && Array.isArray(payload.data)) {
        return payload.data;
    }
    if (payload.data && Array.isArray(payload.data.data)) {
        return payload.data.data;
    }
    return [];
};

const sortByName = (collection) =>
    collection.sort((a, b) =>
        a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })
    );

const loadFilterOptions = async () => {
    try {
        const [groupsResponse, organizationsResponse] = await Promise.all([
            httpRequest({
                url: window.public_path + '/api/group/list-select',
                method: 'POST',
            }),
            httpRequest({
                url: window.public_path + '/api/organization/list-select',
                method: 'POST',
            }),
        ]);

        groupOptions.value = sortByName(
            toArray(groupsResponse)
                .map((item) => ({
                    uuid: item?.uuid ?? null,
                    name: item?.name ?? null,
                }))
                .filter((item) => item.uuid && item.name)
        );

        organizationOptions.value = sortByName(
            toArray(organizationsResponse)
                .map((item) => ({
                    uuid: item?.uuid ?? null,
                    name: item?.name ?? null,
                }))
                .filter((item) => item.uuid && item.name)
        );
    } catch (error) {
        console.error(
            'Error cargando las opciones de filtro de usuarios',
            error
        );
    }
};

const clearFilters = () => {
    pagination.clearFilters();
    pagination.filters.group_uuid = '';
    pagination.filters.organization_uuid = '';
};

pagination.syncData();

const selection = useMultipleSelectionRecords(tableId, {
    selectionKey: 'uuid',
});

const {
    isSelecting,
    selectedPayloads,
    selectionCount,
    toggleRecordSelection: toggleSelectionRecord,
    selectManyRecords,
    deselectManyRecords,
    isRecordSelected,
    selectedKeys,
} = selection;

const visibleItems = computed(() => pagination.paginator?.data ?? []);

const selectedItems = selectedPayloads;

const allVisibleSelected = computed(() => {
    if (!isSelecting.value) {
        return false;
    }
    const items = visibleItems.value;
    if (items.length === 0) {
        return false;
    }
    return items.every((item) => isRecordSelected(item));
});

const isIndeterminate = computed(() => {
    if (!isSelecting.value) {
        return false;
    }
    if (visibleItems.value.length === 0) {
        return false;
    }
    return selectionCount.value > 0 && !allVisibleSelected.value;
});

const toggleSelectAll = (checked) => {
    const items = visibleItems.value;
    if (checked) {
        selectManyRecords(items);
    } else {
        deselectManyRecords(items);
    }
};

const toggleRecordSelection = (item) => {
    toggleSelectionRecord(item);
};

const resetPasswordMultiple = (records = selectedItems.value) => {
    if (!records || records.length === 0) {
        alert('No hay usuarios seleccionados');
        return;
    }
    window.awesomeModal
        .confirm(
            'Restablecer contraseña',
            `Se restablecerá la contraseña de ${records.length} usuario(s).<br>` +
                '<strong>Esta acción enviará un correo electrónico a cada usuario con una nueva contraseña generada aleatoriamente.</strong><br>' +
                '¿Desea continuar?'
        )
        .then((result) => {
            if (result) {
                let modal = awesomeModal.loading();
                let form_data = new FormData();
                selectedKeys.value.forEach((key) => {
                    form_data.append('uuids[]', key);
                });
                httpRequest({
                    url:
                        window.public_path +
                        '/api/user/reset-password-multiple',
                    method: 'POST',
                    data: form_data,
                })
                    .then((data) => {
                        modal.close();
                        awesomeModal.alert(
                            'Contraseñas restablecidas',
                            'Las contraseñas de los usuarios seleccionados han sido restablecidas y se les ha enviado un correo electrónico con la nueva contraseña.'
                        );
                    })
                    .catch((error) => {
                        modal.close();
                        console.log(error);
                    });
            }
        });
};

onMounted(() => {
    loadFilterOptions();
});

const loginAs = (id) => {
    window.awesomeModal
        .confirm(
            '¿Está seguro?',
            '¿Está seguro que desea ingresar como este usuario?'
        )
        .then((result) => {
            if (result) {
                let modal = awesomeModal.loading();
                let form_data = new FormData();

                form_data.append('target_id', id);

                httpRequest({
                    url: window.public_path + '/api/user/login-as',
                    method: 'POST',
                    data: form_data,
                })
                    .then((data) => {
                        modal.close();
                        window.location.href = window.public_path;
                    })
                    .catch((error) => {
                        modal.close();
                        console.log(error);
                    });
            }
        });
};
</script>
<style lang="scss" scoped></style>
