<template>
    <div class="controls">
        <h1 class="controls__title">
            <slot name="title"></slot>
        </h1>
        <slot name="title-vanilla"></slot>
        <div class="controls__buttons">
            <slot name="buttons"></slot>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    //flex-direction: column;
    &__title {
        font-weight: 600;
        font-size: 30px;
        line-height: 48px;
        color: #000000;
        padding: 0;
        margin: 0 0 2px 0;
        white-space: nowrap;
        // text-transform: uppercase;
    }
    &__buttons {
        display: flex;
        gap: 15px;
        margin-left: auto;
        align-items: flex-end;
        width: 100%;
        justify-content: flex-end;
    }
}
</style>
