/*
import {
    InputsRegister
} from './components/Inputs/index.js'


import SectionHeader from './components/SectionHeader.vue'
import Main      from './components/Layouts/Main.vue'
import Dropdown  from './components/Dropdown/index.vue'
import Paginator from './components/Paginator/index.vue'
import Notes       from './components/Notes/index.vue'
import ButtonAlert from './components/Notes/ButtonAlert.vue'
import { InputsRegister } from './components/Inputs/index'
import { BoxesRegister }  from './components/SideBar/index.js'
import { dashboardFront } from 'E:\\work\\html\\packages\\aporteweb\\dashboard-front-v2\\index'
import { dashboardFront } from 'dashboard-front-v2/index'
import { dashboardFront } from '../../node_modules/dashboard-front-v2/index'
import module from 'dashboard-front-v2/index' and watch changes realtime recursive webpack
import './assets/main.scss'
*/

import SectionHeader from './components/SectionHeader.vue'
import Main      from './components/Layouts/Main.vue'
import Dropdown  from './components/Dropdown/index.vue'
import Paginator from './components/Paginator/index.vue'
import Notes       from './components/Notes/index.vue'
import ButtonAlert from './components/Notes/ButtonAlert.vue'
import { InputsRegister } from './components/Inputs/index'
import { BoxesRegister }  from './components/Boxes/index.js'
import Modal from './components/Modal/index.vue'
import TopBarJobs from './components/TopBar/TopBarJobs.vue'


const dashboardFront = ({
    app,
    router,
    reactive,
    ref,
    inject,
    watch,
    onMounted,
    watchEffect,
    computed,
    useRoute,
    useRouter,
    onBeforeRouteLeave,
    onBeforeRouteUpdate,
    RouterLink,
    RouterView
}) => {
    
    window.appDependencies = {
        app,
        router,
        reactive,
        ref,
        inject,
        watch,
        onMounted,
        watchEffect,
        computed,
        useRoute,
        useRouter,
        onBeforeRouteLeave,
        onBeforeRouteUpdate,
        RouterLink,
        RouterView
    }

    app.component('SectionHeader', SectionHeader)
    app.component('Notes', Notes)
    app.component('ButtonAlert', ButtonAlert)
    app.component('Dropdown', Dropdown)
    
    app.component('Main', Main)
    app.component('Paginator', Paginator)
    app.component('Modal', Modal)
    
    app.component('TopBarJobs', TopBarJobs)
    
    InputsRegister(app)
    BoxesRegister(app)

    window.public_path = document.head.querySelector('meta[name="public-path"]')
    if (window.public_path) {
        window.public_path = window.public_path.content.replace(/\/$/, '')
    } else {
        window.public_path = ''
    }
    
    window.todayFormatted = () => {
        // Obtener la fecha actual
        let hoy = new Date();

        // Obtener el día, el mes y el año
        let dia = hoy.getDate();
        let mes = hoy.getMonth() + 1; // Los meses empiezan en 0
        let año = hoy.getFullYear();

        // Añadir un cero delante si el día o el mes son menores que 10
        if (dia < 10) {
        dia = "0" + dia;
        }
        if (mes < 10) {
        mes = "0" + mes;
        }

        // Formatear la fecha como DD/MM/YYYY
        let fecha = dia + "/" + mes + "/" + año;

        // Devolver la fecha
        return fecha;
    }
    app.provide('todayFormatted', window.todayFormatted)

    window.httpRequest = ({
        url,
        method = 'GET',
        data,
        errors
    }) => {
        if (errors && Object.prototype.toString.call(errors) === '[object Object]') {
            // clear all errors
            Object.keys(errors).forEach(key => {
                errors[key].splice(0, errors[key].length)
            })
        }
        return new Promise((resolve, reject) => {
            fetch(url, {
                method: method,
                body: data,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                },
            })
            .then((response) => {
                const bodyData = response.json()
                if (response.ok) {
                    resolve(bodyData)
                }
                // Código de estado: 401 Unauthorized
                if (response.status == 401) {
                    console.log('acceso denegado')
                    router.push('/login')
                    reject(response)
                }
                // Código de estado: 405 Method Not Allowed
                if (response.status == 405) {
                    bodyData.then((data) => {
                        awesomeModal.error('Error', `
                            <p>Ha ocurrido un error 405: Metodo no permitido.</p>
                            <p>${data.message}</p>
                        `)
                        reject(data)
                    })
                }
                // Código de estado: 422 Unprocessable Content
                if (response.status == 422) {
                    // asignar errores
                    // se debe resolver la promesa para obtener los datos
                    bodyData.then((data) => {
                        if (errors && Object.prototype.toString.call(errors) === '[object Object]') {
                            Object.assign(errors, data.errors)
                        } else {
                        }
                        awesomeModal.error('Tiene errores en el formulario', `
                            ${ '<ul style="border: 1px solid #F00; padding-top: 15px; padding-bottom: 15px; background-color: #ffb6b61f;">' + Object.keys(data.errors).map((key) => {
                                return data.errors[key].map((error) => {
                                    return `<li class="mb-2" style="text-align: left; color: #F00;">${error}</li>`
                                }).join('')
                            }).join('') + '</ul>' }
                        `)
                        reject(data)
                    })
                }
                // Código de estado: 500 Internal Server Error
                if (response.status == 500) {
                    bodyData.then((data) => {
                        reject(data)
                        awesomeModal.error('Error', `
                            <p>Ha ocurrido un error inesperado.</p>
                            <p>${data.message}</p>
                        `)
                    })
                }
                reject(response)
                // throw new Error(response);
            })
        })
    
    }
    

    window.formatSeconds = (seconds) => {
        seconds = parseInt(seconds)
        var horas = Math.floor(seconds / 3600); // obtener horas
        var minutos = Math.floor((seconds % 3600) / 60); // obtener minutos
        var segundos = seconds % 60; // obtener segundos
        // agregar ceros si es necesario
        if (horas < 10) horas = '0' + horas;
        if (minutos < 10) minutos = '0' + minutos;
        if (segundos < 10) segundos = '0' + segundos;
        return horas + ':' + minutos + ':' + segundos; // devolver el resultado
    }
    app.provide('formatSeconds', window.formatSeconds)

    // public asset or public path or path asset
    window.pathAsset = (path) => {
        return `${window.public_path}/${path}`
    }
    window.toggle = ( value, trueValue, falseValue ) => {
        if (value === trueValue) {
            return falseValue
        }
        return trueValue
    }

    window.$globalState.auth = {
        user: {},
        status: 'error',
    }
    window.$globalState.render = false

    window.userCan = (permission) => {
        return window?.$globalState?.auth?.status == "success" && window?.$globalState?.auth?.user?.permissions[permission] && window?.$globalState?.auth?.user?.permissions[permission]?.access == true
    }
    $globalState.sidebar = {
        // side-bar__wrapper--relative
        // side-bar__wrapper--absolute
        position: {
            value: 'side-bar__wrapper--absolute',
            toggle() {
                this.value = toggle(this.value, 'side-bar__wrapper--relative', 'side-bar__wrapper--absolute')
                localStorage.setItem('sidebar-position', this.value)
            }
        },
        // side-bar__wrapper--left
        // side-bar__wrapper--right
        place: {
            value: 'side-bar__wrapper--left',
            toggle() {
                this.value = toggle(this.value, 'side-bar__wrapper--left', 'side-bar__wrapper--right')
                localStorage.setItem('sidebar-place', this.value)
            }
        },
        // side-bar__wrapper--show
        // side-bar__wrapper--hide
        show: {
            value: 'side-bar__wrapper--hide',
            toggle() {
                this.value = toggle(this.value, 'side-bar__wrapper--show', 'side-bar__wrapper--hide')
                localStorage.setItem('sidebar-show', this.value)
            }
        }
    }
    $globalState.sidebar.position.value = localStorage.getItem('sidebar-position') || $globalState.sidebar.position.value
    $globalState.sidebar.place.value    = localStorage.getItem('sidebar-place')    || $globalState.sidebar.place.value
    $globalState.sidebar.show.value     = localStorage.getItem('sidebar-show')     || $globalState.sidebar.show.value

    window.appInstance = app
    const logout = () => {
        let modal = awesomeModal.loading()
        httpRequest({
            url: window.public_path + '/api/logout',
            method: 'GET'
        })
        .then((data) => {
            modal.close()
            window.$globalState.auth.status = 'error'
            router.push('/login')
        })
        .catch((error) => {
            modal.close()
        })
    
    }
    window.logout = logout
    
    app.provide('$globalState', window.$globalState)
    //app.config.globalProperties.$globalState = window.$globalState
    
    window.verifyAuth = async () => {
        return new Promise((resolve, reject) => {
            httpRequest({
                url: window.public_path + '/api/check-auth',
                method: 'GET'
            })
            .then((data) => {
                if (data.status == 'error') {
                    window.$globalState.auth.status = 'error'
                    window.$globalState.render = true
                    awesomeModal.closeAll()
                    // URL accedible sin autenticación
                    let URLs = [
                        '/login',
                        '/register',
                        '/recover-password',
                        '/password-reset'
                    ]
                    if (!URLs.includes(router.currentRoute.value.path)) {
                        router.push('/login')
                    }
                    resolve(false)
                    return
                }
                Object.assign(window.$globalState.auth.user, data.user)
                window.$globalState.auth.status = 'success'
                window.$globalState.render = true
                resolve(true)
            })
            .catch((error) => {})
        })
    }
    window.verifyAuth()
    app.mixin({
        methods: {
            pathAsset(path) {
                // remove first slash
                path = path.replace(/^\//, '')
                return `${window.public_path}/${path}`
            },
            logout() {
                return window.logout()
            },
            formatSeconds(seconds) {
                return window.formatSeconds(seconds)
            },
            todayFormatted() {
                return window.todayFormatted()
            }
        }
    })
    
    /*
    en vue 3 no se puede usar el filters globalProperties
    en si lugar se recomienda usar computed
    app.config.globalProperties.$filters = {
        pathAsset(path) {
            return window.pathAsset(path)
        }
    }
    */

    window.toCurrency = (numero, decimales = 2) => {
        let separadorDecimal = document.head.querySelector('meta[name="decimal-separator"]')
        if (separadorDecimal) {
            separadorDecimal = separadorDecimal.content
        } else {
            separadorDecimal = ",";
        }
        let separadorMiles   = document.head.querySelector('meta[name="thousands-separator"]')
        if (separadorMiles) {
            separadorMiles = separadorMiles.content
        } else {
            separadorMiles = ".";
        }
        let partes, array;
    
        if ( !isFinite(numero) || isNaN(numero = parseFloat(numero)) ) {
            return "";
        }
    
        // Redondeamos
        if ( !isNaN(parseInt(decimales)) ) {
            if (decimales >= 0) {
                numero = numero.toFixed(decimales);
            } else {
                numero = (
                    Math.round(numero / Math.pow(10, Math.abs(decimales))) * Math.pow(10, Math.abs(decimales))
                ).toFixed();
            }
        } else {
            numero = numero.toString();
        }
    
        // Damos formato
        partes = numero.split(".", 2);
        array = partes[0].split("");
        for (var i=array.length-3; i>0 && array[i-1]!=="-"; i-=3) {
            array.splice(i, 0, separadorMiles);
        }
        numero = array.join("");
    
        if (partes.length>1) {
            numero += separadorDecimal + partes[1];
        }
    
        return numero;
    }
    app.config.globalProperties.$filters = {
        toCurrency(numero, decimales = 2) {
            return window.toCurrency(numero, decimales)
        }
    }
    app.config.globalProperties.userCan = window.userCan

    window.dataPaginator = ({
        urlBase,
        filtersKeys = [],
        actions = {},
        config = {
            layout: [],
            cachePrefix: '',
            deleteEnpoint: '', // example: window.public_path + '/api/pedido/delete/${uuid}'
            restoreEnpoint: '', // example: window.public_path + '/api/pedido/restore/${uuid}'
        },
        appendFormData = []
    }) => {
        const trash = ref(false)

        const sort = reactive({
            column: null,
            order: null,
        })

        const sortBy = (column) => {
            if (column == sort.column) {
                sort.order = toggle(sort.order, 'asc', 'desc')
            } else {
                sort.column = column
                sort.order = 'asc'
            }
            syncData()
        }
        // defino la variable paginator, que se usará para almacenar los datos de la paginación
        const paginator = reactive({})
    
        // defino la variable endpoint, que se usará para almacenar la url de la api
        const endpoint = reactive({
            dataUrl: urlBase,
            lastUrl: null,
        })
        
        // defino la variable filters, que se usará para almacenar los filtros de búsqueda
        const filters = reactive({})

        const permanentFilters = reactive([])

        const permanentSort = reactive([])
    
        // defino la variable appliedFilters, que se usará para almacenar los filtros de búsqueda aplicados
        const appliedFilters = reactive({})
    
        // se inicializan los filtros
        filtersKeys.forEach((key) => {
            filters[key] = ''
            appliedFilters[key] = ''
        })

        // se define la función applyFilters, que se ejecutará al hacer click en el botón de buscar
        const applyFilters = () => {
            // se asignan los valores de los filtros a la variable appliedFilters
            filtersKeys.forEach((key) => {
                appliedFilters[key] = filters[key]
            })    
            // se ejecuta la función syncData, que se encarga de sincronizar los datos con la api
            syncData(endpoint.dataUrl)
        }

        const applyAction = (action) => {
            actions[action]({
                appliedFilters,
            })
        }

        // se define la función clearFilters, que se ejecutará al hacer click en el botón de limpiar filtros
        const clearFilters = () => {
            // clear sort
            sort.column = null
            sort.order = null

            // se limpian los filtros
            for (const key in filters) {
                filters[key] = ''
            }
            for (const key in appliedFilters) {
                appliedFilters[key] = ''
            }
            syncData(endpoint.dataUrl)
        }

        const deleteItem = (item) => {
            window.awesomeModal.confirm(
                '¿Está seguro?',
                '¿Está seguro que desea eliminar este registro?',
            ).then((result) => {
                if (result) {
                    let modal = window.awesomeModal.loading()
                    httpRequest({
                        url: config.deleteEnpoint.replace('${uuid}', item.uuid),
                        method: 'GET'
                    })
                    .then((data) => {
                        modal.close()
                        window.awesomeModal.alert('Registro eliminado correctamente')
                        syncData()
                    })
                    .catch((error) => {
                        modal.close()
                        if (error.response.status === 422) {
                            errors.po = error.response.data.errors.po
                        }
                    })
                }
            })
        }
    
        const restoreItem = (item) => {
            window.awesomeModal.confirm(
                '¿Está seguro?',
                '¿Está seguro que desea restaurar este registro?',
            ).then((result) => {
                if (result) {
                    let modal = window.awesomeModal.loading()
                    httpRequest({
                        url: config.restoreEnpoint.replace('${uuid}', item.uuid),
                        method: 'GET'
                    })
                    .then((data) => {
                        modal.close()
                        window.awesomeModal.alert('Registro restaurado correctamente')
                        syncData()
                    })
                    .catch((error) => {
                        modal.close()
                        if (error.response.status === 422) {
                            errors.po = error.response.data.errors.po
                        }
                    })
                }
            })
        }

        const loadPermanentFilters = () => {
            permanentFilters.splice(0, permanentFilters.length)
            const permanentFiltersState = JSON.parse(localStorage.getItem('permanent-filters-state-pedido'))
            if (permanentFiltersState) {
                permanentFiltersState.forEach((filter) => {
                    permanentFilters.push(filter)
                })
            }
            permanentSort.splice(0, permanentSort.length)
            const permanentSortState = JSON.parse(localStorage.getItem('permanent-sort-state-pedido'))
            if (permanentSortState) {
                permanentSortState.forEach((sort) => {
                    permanentSort.push(sort)
                })
            }
        }

        // se define la función syncData, que se encarga de sincronizar los datos con la api
        const syncData = (url) => {
            // se muestra el modal de carga
            let modal = awesomeModal.loading()
            // se verifica si el endpoint tiene la propiedad lastUrl, si no la tiene, se le asigna el valor de dataUrl
            if ( !endpoint.lastUrl ) {
                endpoint.lastUrl = endpoint.dataUrl
            }
    
            // se verifica si se ha pasado una url como parámetro, si no se ha pasado, se le asigna el valor de lastUrl
            if (!url) {
                url = endpoint.lastUrl
            } else {
                endpoint.lastUrl = url
            }
    
            // se crea un objeto FormData, que se usará para adjuntar los filtros de búsqueda
            const form_data = new FormData()
            for (const [key, value] of Object.entries(appliedFilters)) {
                if (value) {
                    form_data.append('filters[' + key + ']', value)
                }
            }

            // appendFormData
            console.clear()
            appendFormData.forEach((item) => {
                console.log(item)
                form_data.append(item.key, item.value)
            })
            // si la variable trash es true
            if (trash.value) {
                form_data.append('trash', 1)
            }

            if (sort.column) {
                form_data.append('sort[column]', sort.column)
                form_data.append('sort[order]', sort.order)
            }

            // se agregan los filtros permanentes
            loadPermanentFilters()
            permanentFilters.forEach((filter, index) => {
                form_data.append('permanent_filters[' + index + '][column]',   filter.column)
                form_data.append('permanent_filters[' + index + '][operator]', filter.operator)
                form_data.append('permanent_filters[' + index + '][value]',    filter.value)
            })
            permanentSort.forEach((sort, index) => {
                form_data.append('permanent_sort[' + index + '][column]', sort.column)
                form_data.append('permanent_sort[' + index + '][order]',  sort.order)
            })
            
            // se realiza la petición a la api
            httpRequest({
                url: url,
                method: 'POST',
                data: form_data,
            })
            .then((data) => {
                // cada item paginator.data.item debe tener 2 metodos, deleteItem, restoreItem
                // creo el proxy
                data.data = data.data.map((item) => {
                    item = new Proxy(item, {
                        get: function(target, prop) {
                            if (prop == 'deleteItem') {
                                return () => {
                                    deleteItem(target)
                                }
                            }
                            if (prop == 'restoreItem') {
                                return () => {
                                    restoreItem(target)
                                }
                            }
                            return target[prop]
                        }
                    })

                    return item
                })
                Object.assign(paginator, data)
                modal.close()
            })
            .catch((error) => {
                modal.close()
            })
        }
    
        // watch para el cambio de la variable trash
        watch(trash, () => {
            syncData(endpoint.dataUrl)
        })
    
        return {
            sort,
            sortBy,
            trash,
            paginator,
            endpoint,
            filters,
            appliedFilters,
            appendFormData,
            applyFilters,
            applyAction,
            clearFilters,
            syncData
        }
    }
}

export {
    dashboardFront,
    // InputsRegister
}