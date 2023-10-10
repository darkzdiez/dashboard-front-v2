<template>
    <Main>
        <router-view v-slot="{ Component }">
            <component :is="Component" />
        </router-view>
    </Main>
</template>

<style lang="scss" scoped>
</style>