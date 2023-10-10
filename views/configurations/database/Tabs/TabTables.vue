<template>
    <div class="grid-3 gap-15">
        <div v-for="table in tables" class="input-group">
            <label>{{ table }}</label>
            <button
                class="btn btn--small btn--green"
                disabled
            >
                <i class="fas fa-eye"></i>
            </button>
            <button
                class="btn btn--small btn--yellow"
            >
                <i class="fas fa-database"></i>
            </button>
            <button
                class="btn btn--small btn--yellow"
            >
                <i class="fas fa-download"></i>
            </button>
            <button
                class="btn btn--small btn--lightblue"
                @click="generateSeeder(table)"
            >
                <i class="fas fa-seedling"></i>
            </button>
            <button
                class="btn btn--small btn--lightblue"
                @click="executeSeeder(table)"
            >
                <i class="fas fa-play"></i>
            </button>
        </div>
    </div>
</template>

<script setup>
    import { reactive, ref, watch, watchEffect } from 'vue'
    import { useRoute, useRouter } from 'vue-router'

    const route = useRoute()
    const router = useRouter()
    const tables = reactive([])

    httpRequest({
        url: window.public_path + '/api/database/tables',
        method: 'GET',
    })
    .then((data) => {
        tables.push(...data)
    })
    .catch((error) => {
    })

    const generateSeeder = (table) => {
        window.awesomeModal.confirm('Generar seeder', '¿Está seguro de generar el seeder de la tabla ' + table + '?')
            .then(value => {
                if (value) {
                    window.awesomeModal.loading()
                    const formData = new FormData()
                    formData.append('table', table)

                    httpRequest({
                        url: window.public_path + '/api/database/table/seeders/generate',
                        method: 'POST',
                        data: formData,
                    })
                    .then((data) => {
                        window.awesomeModal.closeAll()
                        window.awesomeModal.alert('Seeder generado', 'El seeder de la tabla ' + table + ' ha sido generado correctamente')
                    })
                    .catch((error) => {
                        window.awesomeModal.closeAll()
                        window.awesomeModal.alert('Error', 'Ha ocurrido un error al generar el seeder de la tabla ' + table)
                    })
                }
            })
    }

    const executeSeeder = (table) => {
        window.awesomeModal.confirm('Ejecutar seeder', '¿Está seguro de ejecutar el seeder de la tabla ' + table + '?')
            .then(value => {
                if (value) {
                    window.awesomeModal.loading()
                    const formData = new FormData()
                    formData.append('table', table)

                    httpRequest({
                        url: window.public_path + '/api/database/table/seeders/execute',
                        method: 'POST',
                        data: formData,
                    })
                    .then((data) => {
                        window.awesomeModal.closeAll()
                        window.awesomeModal.alert('Seeder ejecutado', 'El seeder de la tabla ' + table + ' ha sido ejecutado correctamente')
                    })
                    .catch((error) => {
                        window.awesomeModal.closeAll()
                        window.awesomeModal.alert('Error', 'Ha ocurrido un error al ejecutar el seeder de la tabla ' + table)
                    })
                }
            })
    }

</script>
<style lang="scss" scoped>
    .input-group {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 15px;
        border-radius: 5px;
        background-color: #fff;
        box-shadow: 0 0 5px rgba(0,0,0,.1);
        label {
            padding: 0 15px;
            flex: 1;
            overflow: hidden;
            white-space: nowrap;
            font-size: 13px;
        }
    }
</style>
