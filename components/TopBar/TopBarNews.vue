<script setup>
import { inject, reactive } from 'vue';
const $globalState = inject('$globalState');

const news = reactive([]);

const getData = () => {
    httpRequest({
        url: window.public_path + '/api/news/top-bar',
        method: 'GET',
    })
        .then((data) => {
            news.splice(0, news.length);
            news.push(...data);
        })
        .catch((error) => {});
};
getData();
</script>

<template>
    <Dropdown
        class="top-bar__item"
        v-if="$globalState.auth.status == 'success'"
        @click="getData"
    >
        <template #button>
            <i class="fas fa-bullhorn"></i>
        </template>
        <button
            class="dropdown__item task-card"
            v-for="item in news"
            :key="item.uuid"
        >
            <div class="task-card__date">
                <i class="far fa-newspaper"></i> {{ item.created_at_formatted }}
            </div>
            <div class="task-card__text">
                <h3>{{ item.title }}</h3>
                <div
                    v-html="item.description_short"
                    class="task-card__text-content"
                ></div>
            </div>
        </button>
        <div
            class="dropdown__item task-card__show-more"
            v-if="news.last_page > news.from"
        >
            <i class="fas fa-sync-alt"></i>
            Cargar más
        </div>
    </Dropdown>
</template>

<style lang="scss"></style>
