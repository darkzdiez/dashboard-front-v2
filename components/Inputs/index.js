import InputText          from './InputText.vue'
import InputFile          from './InputFile.vue'
import InputPassword      from './InputPassword.vue'
import InputSelect        from './InputSelect.vue'
import InputCheckbox      from './InputCheckbox.vue'
import SelectAutocomplete from './SelectAutocomplete/index.vue'
import InputFake          from './InputFake.vue'
import InputTextarea      from './InputTextarea.vue'
import InputErrors        from './InputErrors.vue'
import SimplePhotoGallery from './SimplePhotoGallery/index.vue'
import FormattedDate      from './FormattedDate.vue'
import wysiwygEditor      from './wysiwyg-editor.vue'
import workControls       from './work-controls/index.vue'
import FormattedTime      from './FormattedTime.vue'

export const InputsRegister = (app) => {
    app.component('InputText', InputText)
    app.component('InputFile', InputFile)
    app.component('InputPassword', InputPassword)
    app.component('InputSelect', InputSelect)
    app.component('InputCheckbox', InputCheckbox)
    app.component('SelectAutocomplete', SelectAutocomplete)
    app.component('InputFake', InputFake)
    app.component('InputTextarea', InputTextarea)
    app.component('InputErrors', InputErrors)
    app.component('SimplePhotoGallery', SimplePhotoGallery)
    app.component('FormattedDate', FormattedDate)
    app.component('wysiwyg-editor', wysiwygEditor)
    app.component('work-controls', workControls)
    app.component('FormattedTime', FormattedTime)
}