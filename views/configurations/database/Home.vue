<template>
    <SectionHeader>
        <template #title>
            Base de datos
        </template>
    </SectionHeader>
    <div class="tabs mb-20">
        <button
            class="tabs__tab"
            :class="{ 'tabs__tab--active': tab == 'tables' }"
            @click.prevent="tab = 'tables'"
        >
            TABLAS
        </button>
        <button
            class="tabs__tab"
            :class="{ 'tabs__tab--active': tab == 'groups' }"
            @click.prevent="tab = 'groups'"
        >
            GRUPOS
        </button>
        <button
            class="tabs__tab"
            :class="{ 'tabs__tab--active': tab == 'backups' }"
            @click.prevent="tab = 'backups'"
        >
            BACKUPS
        </button>
    </div>
    <TabTables v-if="tab == 'tables'" />
    <TabGroups v-if="tab == 'groups'" />
    <TabBackups v-if="tab == 'backups'" />
</template>

<script setup>
    import { reactive, ref, watch, watchEffect } from 'vue'
    import { useRoute, useRouter } from 'vue-router'
    import TabTables from './Tabs/TabTables.vue'
    import TabGroups from './Tabs/TabGroups.vue'
    import TabBackups from './Tabs/TabBackups.vue'

    const route = useRoute()
    const router = useRouter()
    const tab = ref('tables')
    // si tab cambiar, debo cambiar en la url el paramtero tab, ejemplo: /obra/1?tab=habilitadas
    // si no existe el parametro tab, por defecto debe ser habilitadas
    // debo cambiar el tab cuando se cambia la url
    watch(tab, (newValue, oldValue) => {
        // console.log('tab changed' + newValue + oldValue + route.query.tab)
        if ( route.query.tab != newValue ) {
            router.push({ query: { tab: newValue } })
        }
    })
    // si estoy cargando el componente, y esta definido el parametro tab
    // debo asignar el valor del parametro tab a la variable tab
    watchEffect(() => {
        if ( route.query.tab ) {
            tab.value = route.query.tab
        }
    })
    // todo lo anterior se puede abstractar en un mixin, para reutilizarlo en otros componentes
    // ejemplo:


</script>
<style lang="scss" scoped>
    
</style>
