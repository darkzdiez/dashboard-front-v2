<template>
    <div>
        <div class="formatted-date__date">
            {{ onlyDate }}
        </div>
        <div class="formatted-date__time">
            {{ onlyTime }}
        </div>
    </div>
</template>

<script setup>
    import { computed } from '@vue/reactivity';
import { reactive, ref, onMounted, watchEffect } from 'vue'

const props = defineProps({
    date: {
        required: true,
    },
})
// el formato del string debe ser el siguiente:                 2023-06-15 20:07:29
// si viene en este formato debo convertirlo como el de arriba: 2023-06-08T20:07:29.220464Z
// el regex es para saber si viene en el formato de arriba
const localDate = ref(props.date)
const regex = new RegExp('^[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}')
if ( typeof props.date === 'string' && !regex.test(props.date) ) { 
    let dateFormat = new Date(props.date)
    let year = dateFormat.getFullYear()
    let month = dateFormat.getMonth() + 1
    month = month.toString().padStart(2, '0')
    let day = dateFormat.getDate()
    day = day.toString().padStart(2, '0')
    let hours = dateFormat.getHours()
    hours = hours.toString().padStart(2, '0')
    let minutes = dateFormat.getMinutes()
    minutes = minutes.toString().padStart(2, '0')
    let seconds = dateFormat.getSeconds()
    seconds = seconds.toString().padStart(2, '0')
    localDate.value = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

const onlyDate = computed(() => {
    // si es null, o vacio, o undefined, o no es un string, devuelvo un string vacio
    if (localDate.value === null || localDate.value === '' || localDate.value === undefined || typeof localDate.value !== 'string') {
        return '--/--/----'
    }
    // format 14/05/22
    let date = localDate.value.split(' ')[0]
    if (date === undefined) {
        return '--/--/----'
    }
    let dateParts = date.split('-')
    return `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`
})

const onlyTime = computed(() => {
    // si es null, o vacio, o undefined, o no es un string, devuelvo un string vacio
    if (localDate.value === null || localDate.value === '' || localDate.value === undefined || typeof localDate.value !== 'string') {
        return '00:00'
    }
    // format 04:32 PM
    let time = localDate.value.split(' ')[1]
    if (time === undefined) {
        return '00:00'
    }
    let timeParts = time.split(':')
    let hours = timeParts[0]
    let minutes = timeParts[1]
    let ampm = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12
    hours = hours ? hours : 12
    return `${hours}:${minutes} ${ampm}`
})
</script>

<style lang="scss" scoped>
.formatted-date__date {
    font-weight: 400;
    font-size: 14px;
    line-height: 17px;
    text-align: center;
    color: #656565;
}
.formatted-date__time {
    font-weight: 400;
    font-size: 14px;
    line-height: 17px;
    text-align: center;
    color: #0C0C0C;
}
</style>
