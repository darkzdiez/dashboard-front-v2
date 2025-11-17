<template>
    <div
        class="list-group"
        v-if="permissionsGroup && Object.keys(permissionsGroup).length > 0"
    >
        <div
            v-for="(group, key) in permissionsGroup"
            :key="key"
            class="list-group__item"
        >
            <h4>
                {{ key }}
                <button type="button" @click="toggleGroup(key, group)">
                    <i
                        :class="
                            groupSelected(group)
                                ? 'fa fa-toggle-on'
                                : 'fa fa-toggle-off'
                        "
                        aria-hidden="true"
                    ></i>
                </button>
            </h4>
            <div class="grid-1 gap-1">
                <InputCheckbox
                    v-for="(item, idx) in group"
                    :key="idx"
                    :label="item.description"
                    :true-value="item.id"
                    v-model="formPermissions"
                />
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, reactive } from 'vue';

const props = defineProps({
    form: {
        type: Object,
        required: true,
    },
});

// Propiedad computada para acceder a form.permissions
const formPermissions = computed({
    get: () => props.form.permissions,
    set: (val) => {
        props.form.permissions = val;
    },
});

const permissions = reactive([]);
const permissionsGroup = reactive({});

function groupSelected(group) {
    return group.every((item) => formPermissions.value.indexOf(item.id) !== -1);
}

function toggleGroup(key, group) {
    const selected = formPermissions.value;
    const allSelected = groupSelected(group);
    if (allSelected) {
        group.forEach((item) => {
            const index = selected.indexOf(item.id);
            if (index !== -1) selected.splice(index, 1);
        });
    } else {
        group.forEach((item) => {
            if (selected.indexOf(item.id) === -1) selected.push(item.id);
        });
    }
}

let modal = awesomeModal.loading();
httpRequest({
    url: window.public_path + '/api/permission/list-select',
    method: 'POST',
})
    .then((data) => {
        permissions.push(...data);
        // permissions.data es un array que cada elemento es un objeto uno de sus atributos es group_prefix la idea es
        // crear un objeto que el key sea group_prefix y el value sea un array con los permisos de ese group_prefix

        permissions.forEach((permission) => {
            if (!permissionsGroup[permission.group_prefix]) {
                permissionsGroup[permission.group_prefix] = [];
            }
            permissionsGroup[permission.group_prefix].push(permission);
        });

        modal.close();
    })
    .catch((error) => {
        modal.close();
    });
</script>

<style lang="scss" scoped>
// pinterest like grid, masonry layout
.list-group {
    display: flex;
    flex-wrap: wrap;
    flex-direction: column;
    max-height: 200vh;
    justify-content: flex-start;
    gap: 1rem;
    &__item {
        border: 1px solid #e5e5e5;
        border-radius: 5px;
        padding: 15px;
        h4 {
            margin: 0 0 10px;
        }
    }
}
</style>
