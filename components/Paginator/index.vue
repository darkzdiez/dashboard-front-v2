<template>
    <!-- Paginator -->
    <div class="paginator">
        <div class="paginator__info">
            {{ getTextByLocale({ es: 'Mostrando', en: 'Showing' }) }}
            <strong>{{ paginator.from }}</strong>
            {{ getTextByLocale({ es: 'a', en: 'to' }) }}
            <strong>{{ paginator.to }}</strong>
            {{ getTextByLocale({ es: 'de', en: 'of' }) }}
            <strong>{{ paginator.total }}</strong>
            {{
                getTextByLocale({
                    es: 'registros, se muestran',
                    en: 'records, displaying',
                })
            }}
            <strong>{{ paginator.per_page }}</strong>
            {{ getTextByLocale({ es: 'por página.', en: 'per page.' }) }}
        </div>
        <div class="paginator__buttons">
            <button
                v-for="(link, key) in paginator.links"
                :key="key"
                :disabled="link.active"
                @click="$emit('change', link.url)"
                v-html="link.label"
            ></button>
        </div>
    </div>
</template>
<script setup>
import { defineProps } from 'vue';

defineProps({
    paginator: {
        type: Object,
        required: true,
    },
});
</script>

<style lang="scss" scoped>
.paginator {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    margin-top: 20px;

    &__info {
        font-size: 0.9rem;
        color: #666;
    }

    &__buttons {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: 8px;
        max-width: 100%;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;

        button {
            border: none;
            background-color: transparent;
            color: #666;
            font-size: 0.9rem;
            cursor: pointer;
            margin-left: 0;
            padding: 5px 10px;
            border-radius: 5px;
            transition: all 0.2s ease-in-out;

            &:hover {
                background-color: #e5e5e5;
            }

            &[disabled] {
                color: #ccc;
                cursor: not-allowed;
                &:hover {
                    background-color: transparent;
                }
            }
        }
    }

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: stretch;

        &__info {
            line-height: 1.45;
        }

        &__buttons {
            justify-content: flex-start;
            padding-bottom: 4px;
        }

        &__buttons button {
            flex: 0 0 auto;
            min-width: 36px;
            min-height: 36px;
        }
    }
}
</style>
