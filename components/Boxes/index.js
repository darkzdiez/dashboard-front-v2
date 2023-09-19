import StateMiniBox from './StateMiniBox.vue'
import StateMiniBoxColors from './StateMiniBoxColors.vue'

export const BoxesRegister = (app) => {
    app.component('StateMiniBox', StateMiniBox)
    app.component('StateMiniBoxColors', StateMiniBoxColors)
}