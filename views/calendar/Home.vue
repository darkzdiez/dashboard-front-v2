<template>
    <div class="grid-1">
        <div class="col-12 justify-content-center" v-if="loaded == 0">
            <h3>
                <center>
                    <i class="fas fa-sync fa-spin"></i><br />Cargando
                </center>
            </h3>
        </div>
        <div class="col-12 justify-content-center" v-if="loaded == 2">
            <h3>
                <center>
                    <i class="fas fa-sync fa-spin"></i><br />Guardando
                </center>
            </h3>
        </div>
        <div class="col-1" v-if="loaded == 1">
            <div class="calendar__controls">
                <button class="calendar__control me-auto" @click="goToday">
                    <i class="fas fa-calendar-day"></i> Hoy
                </button>
                <button class="calendar__control" @click="goTo(calendar.prev)">
                    <i class="fas fa-angle-double-left"></i>
                </button>
                <div class="calendar__title">{{ calendar.title }}</div>
                <button class="calendar__control" @click="goTo(calendar.next)">
                    <i class="fas fa-angle-double-right"></i>
                </button>
                <button
                    class="calendar__control ms-auto"
                    @click="updateCalendar"
                >
                    <i class="fas fa-sync"></i> Actualizar
                </button>
            </div>
            <table class="calendar__table">
                <thead>
                    <tr>
                        <th>Domingo</th>
                        <th>Lunes</th>
                        <th>Martes</th>
                        <th>Miercoles</th>
                        <th>Jueves</th>
                        <th>Viernes</th>
                        <th>Sabado</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="week in calendar.weeks">
                        <template v-for="(day, dayKey) in week.days">
                            <td v-if="day && day.available" class="p-0">
                                <div
                                    class="calendar__week-events"
                                    v-if="dayKey == 0"
                                >
                                    <div
                                        v-for="(event, eventKey) in week.events"
                                        class="calendar__week-event"
                                        :style="
                                            'top: ' +
                                            (40 * eventKey + 70) +
                                            'px; left: calc(' +
                                            100 * event.start +
                                            '% + ' +
                                            1 * event.start +
                                            'px); width: calc(' +
                                            100 * event.size +
                                            '% + ' +
                                            1 * event.size +
                                            'px); background: ' +
                                            event.bgColor +
                                            '; padding: 6px 16px; color: ' +
                                            event.textColor +
                                            ';'
                                        "
                                    >
                                        <div class="calendar__week-event-title">
                                            {{ event.title }}
                                        </div>
                                    </div>
                                </div>
                                <router-link
                                    :to="'/calendario/' + day.date + '/day'"
                                    class="calendar__day"
                                    :class="{
                                        'calendar__day--today': day.today,
                                    }"
                                >
                                    <div class="calendar__day-short">
                                        {{ day.day_short }}
                                    </div>
                                    <div class="calendar__day-number">
                                        {{ day.day }}
                                    </div>
                                    <div
                                        v-if="day.dia_info"
                                        class="calendar__day-info"
                                    ></div>
                                </router-link>
                            </td>
                            <td
                                v-else-if="day && !day.available"
                                style="opacity: 0.3"
                                class="p-0"
                            >
                                <div
                                    class="calendar__week-events"
                                    v-if="dayKey == 0"
                                >
                                    <div
                                        v-for="(event, eventKey) in week.events"
                                        class="calendar__week-event"
                                        :style="
                                            'top: ' +
                                            (40 * eventKey + 70) +
                                            'px; left: calc(' +
                                            100 * event.start +
                                            '% + ' +
                                            1 * event.start +
                                            'px); width: calc(' +
                                            100 * event.size +
                                            '% + ' +
                                            1 * event.size +
                                            'px); background: ' +
                                            event.bgColor +
                                            '; padding: 6px 16px; color: ' +
                                            event.textColor +
                                            ';'
                                        "
                                    >
                                        <div class="calendar__week-event-title">
                                            {{ event.title }}
                                        </div>
                                    </div>
                                </div>
                                <router-link
                                    :to="'/calendario/' + day.date + '/day'"
                                    class="calendar__day"
                                    :class="{
                                        'calendar__day--today': day.today,
                                    }"
                                >
                                    <div class="calendar__day-short">
                                        {{ day.day_short }}
                                    </div>
                                    <div class="calendar__day-number">
                                        {{ day.day }}
                                    </div>
                                    <div
                                        v-if="day.dia_info"
                                        class="calendar__day-info"
                                    ></div>
                                </router-link>
                            </td>
                            <td v-else="day" class="p-0">
                                <div
                                    class="calendar__week-events"
                                    v-if="dayKey == 0"
                                >
                                    <div
                                        v-for="(event, eventKey) in week.events"
                                        class="calendar__week-event"
                                        :style="
                                            'top: ' +
                                            (40 * eventKey + 70) +
                                            'px; left: calc(' +
                                            100 * event.start +
                                            '% + ' +
                                            1 * event.start +
                                            'px); width: calc(' +
                                            100 * event.size +
                                            '% + ' +
                                            1 * event.size +
                                            'px); background: ' +
                                            event.bgColor +
                                            '; padding: 6px 16px; color: ' +
                                            event.textColor +
                                            ';'
                                        "
                                    >
                                        <div class="calendar__week-event-title">
                                            {{ event.title }}
                                        </div>
                                    </div>
                                </div>
                            </td>
                        </template>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const calendar = reactive({});
const loaded = ref(0);

const openDay = (day) => {
    router.push({ name: 'calendar.day', params: { date: day.date } });
};

const lastTarget = ref(null);

const goTo = (target = null) => {
    let modal = awesomeModal.loading();
    loaded.value = 0;
    lastTarget.value = target;
    let params = '';
    if (target) {
        router.push({ query: { date: target } });
        params = '?ym=' + target;
    }
    httpRequest({
        url: window.public_path + '/api/calendar' + params,
        method: 'GET',
    })
        .then((data) => {
            Object.assign(calendar, data);
            loaded.value = 1;
            modal.close();
        })
        .catch((error) => {
            loaded.value = 1;
            modal.close();
        });
};

const updateCalendar = () => {
    if (lastTarget.value) {
        goTo(lastTarget.value);
    } else {
        loadCalendar();
    }
};

const goToday = () => {
    lastTarget.value = null;
    loadCalendar();
};

const loadCalendar = () => {
    // let modal = awesomeModal.loading()
    // modal.close()

    if (route.query.date) {
        goTo(route.query.date);
        return;
    }
    goTo();
    return;
};

loadCalendar();
</script>

<style lang="scss" scoped>
.calendar {
    &__table {
        table-layout: fixed;
        border-collapse: collapse;
        width: 100%;
        margin-bottom: 5px;
        tr {
            border-bottom: 1px solid #d8d8d8;
        }
        td {
            border-right: 1px solid #d8d8d8;
            padding: 0;
            vertical-align: top;
        }
    }
    &__day {
        aspect-ratio: 3/4;
        box-sizing: border-box;
        padding: 12px;
        display: flex;
        justify-content: flex-start;
        flex-direction: column;
        align-items: center;
        text-decoration: none;
        &--today {
            background-color: #ffed94;
        }
        &:hover {
            background-color: #d0ffbd;
        }
    }
    &__day-short {
        font-weight: 500;
        font-size: 14px;
        line-height: 17px;
        text-align: center;
        letter-spacing: 0.07em;
        color: #656565;
        margin-bottom: 8px;
    }
    &__day-number {
        font-weight: 500;
        font-size: 16px;
        line-height: 19px;
        text-align: center;
        color: #000000;
    }
    &__controls {
        display: flex;
        justify-content: center;
        gap: 5px;
        margin-bottom: 5px;

        font-weight: 500;
        font-size: 18px;
        line-height: 22px;
        color: #0c0c0c;
        text-transform: uppercase;
    }
    &__control {
        background-color: transparent;
        border: none;
        font-size: 18px;
    }
    &__day-info {
        flex: 1;
        justify-content: center;
        align-items: center;
        display: flex;
        flex-direction: column;
        gap: 6px;
    }
}

.calendar__week-events {
    position: relative;
}
.calendar__week-event {
    position: absolute;
    box-sizing: border-box;
    white-space: nowrap;
    font-size: 13px;
}
.calendar__week-event-title {
}
</style>
