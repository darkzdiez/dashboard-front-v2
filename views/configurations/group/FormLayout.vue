
<template>
    <div class="grid-3 gap-15">
        <InputText
            label="Nombre"
            placeholder=""
            v-model="form.name"
            :error="errors.name"
            class="col-1"
        />
        <InputText
            label="Guard"
            placeholder=""
            v-model="form.guard_name"
            :error="errors.guard_name"
            class="col-1"
        />
        <SelectAutocomplete
            label="Grupo Padre (opcional)"
            v-model="form.parent_id"
            endpoint="/api/group/list-select"
            :error="errors.parent_id"
            class="col-1"
            option-key="id"
            :itemConditional="(option) => { console.log([ 'demo' ]); option.uuid != route.params.uuid }"
        >
            <template #option="{ id, name, uuid }">
                <div>
                    {{ name }}
                </div>
            </template>
        </SelectAutocomplete>
        <wysiwyg-editor label="Descripción" v-model="form.description" :error="errors.description" class="col-3" />
    </div>
    <h3>Permisos:</h3>
    <div class="grid-3 gap-15" v-if="permissions.data && permissions.data.length > 0">
        <InputCheckbox
            v-for="(item, key) in permissions.data"
            :key="key"
            :label="item.description"
            :true-value="item.id"
            v-model="form.permissions"
        />
    </div>
    <h3>Notificaciones y Alertas que recibe:</h3>
    <div class="grid-3 gap-15" v-if="Object.keys(alertTypes) && Object.keys(alertTypes).length > 0">
        <InputCheckbox
            v-for="(item, key) in Object.keys(alertTypes)"
            :key="key"
            :label="alertTypes[item]"
            :true-value="item"
            v-model="form.notifications"
        />
    </div>
</template>

<script setup>
    import { reactive } from "@vue/reactivity";
    import { useRoute, useRouter } from 'vue-router'

    const route = useRoute()
    const router = useRouter()

    defineProps({
        form: {
            type: Object,
            required: true,
        },
        errors: {
            type: Object,
            required: true,
        },
    })

    const permissions = reactive({})
    let modal = awesomeModal.loading()
    httpRequest({
        url: window.public_path + '/api/permission',
        method: 'POST',
    })
    .then((data) => {
        Object.assign(permissions, data)
        modal.close()
    })
    .catch((error) => {
        modal.close()
    })
    const alertTypes = {}
</script>

<style lang="scss" scoped>
</style>