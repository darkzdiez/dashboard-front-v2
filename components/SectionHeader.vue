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
    align-items: flex-start;
    gap: 16px 20px;
    flex-wrap: wrap;
    min-width: 0;
    margin-bottom: 20px;
    //flex-direction: column;
    &__title {
        font-weight: 600;
        font-size: 30px;
        line-height: 38px;
        color: #000000;
        padding: 0;
        margin: 0 0 2px 0;
        max-width: 100%;
        overflow-wrap: anywhere;
        white-space: normal;
        // text-transform: uppercase;
    }
    &__buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-left: auto;
        align-items: center;
        width: auto;
        max-width: 100%;
        justify-content: flex-end;
    }

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;

        &__title {
            font-size: 24px;
            line-height: 30px;
            width: 100%;
        }

        &__buttons {
            justify-content: flex-start;
            align-items: stretch;
            margin-left: 0;
            width: 100%;
            gap: 8px;
        }

        &__buttons :deep(.btn) {
            flex: 1 1 calc(50% - 8px);
            min-width: 0;
            min-height: 38px;
            height: auto;
            padding: 9px 14px;
            line-height: 1.2;
            white-space: normal;
        }
    }

    @media (max-width: 480px) {
        &__buttons :deep(.btn) {
            flex-basis: 100%;
        }
    }
}
</style>
