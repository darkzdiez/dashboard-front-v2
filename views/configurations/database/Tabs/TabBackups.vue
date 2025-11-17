<template>
    <SectionHeader>
        <template #buttons>
            <router-link class="btn btn--darkgray-outline" to="/configurations">
                <i class="fas fa-arrow-left"></i> Volver
            </router-link>
            <button class="btn btn--gray" @click="getData">
                <i class="fas fa-sync-alt"></i> Actualizar
            </button>
            <button class="btn btn--green" @click="generateNewBackup">
                <i class="fas fa-database"></i> Generar Backup
            </button>
        </template>
    </SectionHeader>
    <table>
        <thead>
            <tr>
                <th class="p-0"></th>
                <th>Nombre</th>
                <th>Path</th>
                <th>Tamaño</th>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Acciones</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="(item, key) in backups" :key="key">
                <td class="p-0"></td>
                <td>{{ item.name }}</td>
                <td>{{ item.path }}</td>
                <td>{{ item.size }}</td>
                <td>{{ item.date }}</td>
                <td>{{ item.type }}</td>
                <td>
                    <div class="btns">
                        <a
                            :href="item.url"
                            class="btn btn--green"
                            target="_blank"
                        >
                            <i class="fas fa-download"></i> Descargar
                        </a>
                        <button
                            class="btn btn--red"
                            @click="deleteBackup(item.path)"
                        >
                            <i class="fas fa-trash"></i> Eliminar
                        </button>
                    </div>
                </td>
            </tr>
        </tbody>
    </table>
</template>

<script setup>
import { reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const generateNewBackup = () => {
    window.awesomeModal
        .confirm(
            '¿Está seguro?',
            '¿Está seguro que desea generar un nuevo backup?'
        )
        .then((result) => {
            if (result) {
                window.awesomeModal.loading();
                httpRequest({
                    url: window.public_path + '/api/database/backup/generate',
                    method: 'POST',
                })
                    .then((data) => {
                        getData();
                        window.awesomeModal.closeAll();
                        window.awesomeModal.alert(
                            'Backup generado correctamente'
                        );
                    })
                    .catch((error) => {
                        window.awesomeModal.closeAll();
                    });
            }
        });
};

const deleteBackup = (path) => {
    window.awesomeModal
        .confirm(
            '¿Está seguro?',
            '¿Está seguro que desea eliminar este backup?'
        )
        .then((result) => {
            if (result) {
                window.awesomeModal.loading();
                let data = new FormData();
                data.append('path', path);
                httpRequest({
                    url: window.public_path + '/api/database/backup/delete',
                    method: 'POST',
                    data: data,
                })
                    .then((data) => {
                        getData();
                        window.awesomeModal.closeAll();
                        window.awesomeModal.alert(
                            'Backup eliminado correctamente'
                        );
                    })
                    .catch((error) => {
                        window.awesomeModal.closeAll();
                    });
            }
        });
};

const backups = reactive([]);
const getData = () => {
    backups.splice(0, backups.length);
    let modal = awesomeModal.loading();
    httpRequest({
        url: window.public_path + '/api/database/backup/list',
        method: 'GET',
    })
        .then((data) => {
            backups.push(...data);
            modal.close();
        })
        .catch((error) => {
            modal.close();
        });
};
getData();
</script>
<style lang="scss" scoped>
legend {
    background-color: #000;
    color: #fff;
    padding: 3px 6px;
}
.input-group {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 15px;
    border-radius: 5px;
    background-color: #fff;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
    label {
        padding: 0 15px;
        flex: 1;
        overflow: hidden;
        white-space: nowrap;
        font-size: 13px;
    }
}
</style>
