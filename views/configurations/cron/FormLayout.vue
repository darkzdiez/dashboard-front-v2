<template>
    <div class="grid-5 gap-15">
        <InputText
            label="Descripción"
            placeholder=""
            v-model="form.description"
            :error="errors.description"
            class="col-5"
        />
        <InputSelect
            label="Metodo"
            placeholder=""
            v-model="form.method"
            :options="[
                { key: 'exec', label: 'exec' },
                { key: 'command', label: 'command' },
            ]"
            :error="errors.method"
            class="col-5"
        >
            <template #option="{ key, label }">
                <option :value="key">
                    {{ label }}
                </option>
            </template>
        </InputSelect>
        <InputText
            label="Comando"
            placeholder=""
            v-model="form.command"
            :error="errors.command"
            class="col-5"
        />
        <InputText
            label="Minuto"
            placeholder=""
            v-model="form.minute"
            :error="errors.minute"
            class="col-1"
        />
        <InputText
            label="Hora"
            placeholder=""
            v-model="form.hour"
            :error="errors.hour"
            class="col-1"
        />
        <InputText
            label="Día"
            placeholder=""
            v-model="form.day"
            :error="errors.day"
            class="col-1"
        />
        <InputText
            label="Mes"
            placeholder=""
            v-model="form.month"
            :error="errors.month"
            class="col-1"
        />
        <InputText
            label="Día de la semana"
            placeholder=""
            v-model="form.day_of_week"
            :error="errors.day_of_week"
            class="col-1"
        />
    </div>
    <table class="mt-15" v-if="form.logs.length > 0">
        <thead>
            <tr>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Salida</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="log in form.logs" :key="log.id">
                <td>
                    <i
                        class="fas fa-circle"
                        v-if="log.run_status == 'success'"
                        style="color: green"
                    ></i>
                    <i
                        class="fas fa-circle"
                        v-if="log.run_status == 'failure'"
                        style="color: red"
                    ></i>
                </td>
                <td>
                    {{ log.run_at_formatted }}<br />
                    {{ log.run_at_human }}
                </td>
                <td>
                    <pre>{{ log.output }}</pre>
                </td>
            </tr>
        </tbody>
    </table>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

defineProps({
    form: {
        type: Object,
        required: true,
    },
    errors: {
        type: Object,
        required: true,
    },
});
</script>

<style lang="scss" scoped></style>
