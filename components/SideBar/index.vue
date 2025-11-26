<script setup>
import { inject } from 'vue';

const $globalState = inject('$globalState');
</script>

<template>
    <div
        :class="
            'side-bar__wrapper ' +
            $globalState.sidebar.position.value +
            ' ' +
            $globalState.sidebar.place.value +
            ' ' +
            $globalState.sidebar.show.value
        "
    >
        <div class="side-bar">
            <SidebarContent />
        </div>
    </div>
</template>