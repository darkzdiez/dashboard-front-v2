<script setup>
    import { reactive, ref, watch, inject } from 'vue'
    const $globalState = inject('$globalState')

    const jobs = reactive({
        data: [],
        from: 0,
        last_page: 0,
    })

    const getData = () => {
        httpRequest({
            url: window.public_path + '/api/jobs/top-bar',
            method: 'GET',
        })
        .then((data) => {
            Object.assign(jobs, data)
            /*
            // limpiar el array
            jobs.splice(0, jobs.length)
            // agregar los nuevos datos
            jobs.push(...data)
            */
        })
        .catch((error) => {})
    }
    getData()
</script>

<template>
    <Dropdown class="top-bar__item" v-if="$globalState.auth.status == 'success'" @click="getData">
        <template #button>
            <i class="fas fa-tasks"></i>
        </template>
        <button class="dropdown__item task-card" v-for="job in jobs.data" :key="job.id">
            <div class="task-card__icon">
                <i
                    class="fas fa-check"
                    v-if="job.status == 'finish'"
                ></i>
                <i
                    class="fas fa-spinner fa-spin"
                    v-else-if="job.status == 'running'"
                ></i>
                <i
                    class="fas fa-pause"
                    v-else-if="job.status == 'waiting'"
                ></i>
                <i
                    class="fas fa-exclamation-triangle"
                    v-else-if="job.status == 'failed'"
                ></i>
            </div>
            <div class="task-card__text">
                <h3>{{ job.title }}</h3>
                <p>{{ job.description }}</p>
            </div>
            <div class="task-card__date">
                {{ job.created_at }}
            </div>
        </button>
        <div class="dropdown__item task-card__show-more" v-if="jobs.last_page > jobs.from">
            <i class="fas fa-sync-alt"></i>
            Cargar más
        </div>
    </Dropdown>
</template>

<style lang="scss">

</style>