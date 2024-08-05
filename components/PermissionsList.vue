<template>
    <div class="list-group" v-if="permissionsGroup && Object.keys(permissionsGroup).length > 0">
        <div
            v-for="(group, key) in permissionsGroup"
            :key="key"
            class="list-group__item"
        >
            <h4>{{ key }}</h4>
            <div class="grid-1 gap-1">
                <InputCheckbox
                    v-for="(item, key) in group"
                    :key="key"
                    :label="item.description"
                    :true-value="item.id"
                    v-model="form.permissions"
                />
            </div>
        </div>
    </div>
</template>

<script setup>
    import { ref, reactive } from 'vue'
    
    defineProps({
        form: {
            type: Object,
            required: true
        }
    })


    const permissions = reactive({})
    const permissionsGroup = reactive({})

    let modal = awesomeModal.loading()
    httpRequest({
        url: window.public_path + '/api/permission',
        method: 'POST',
    })
    .then((data) => {
        Object.assign(permissions, data)
        // permissions.data es un array que cada elemento es un objeto uno de sus atributos es group_prefix la idea es
        // crear un objeto que el key sea group_prefix y el value sea un array con los permisos de ese group_prefix

        permissions.data.forEach((permission) => {
            if (!permissionsGroup[permission.group_prefix]) {
                permissionsGroup[permission.group_prefix] = []
            }
            permissionsGroup[permission.group_prefix].push(permission)
        })

        modal.close()
    })
    .catch((error) => {
        modal.close()
    })
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