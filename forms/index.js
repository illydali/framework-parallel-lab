// import in caolan forms
const forms = require("forms");
// create some shortcuts
const fields = forms.fields;
const validators = forms.validators;
const widgets = forms.widgets;

var bootstrapField = function (name, object) {
    if (!Array.isArray(object.widget.classes)) {
        object.widget.classes = [];
    }

    if (object.widget.classes.indexOf('form-control') === -1) {
        object.widget.classes.push('form-control');
    }

    var validationclass = object.value && !object.error ? 'is-valid' : '';
    validationclass = object.error ? 'is-invalid' : validationclass;
    if (validationclass) {
        object.widget.classes.push(validationclass);
    }

    var label = object.labelHTML(name);
    var error = object.error ? '<div class="invalid-feedback">' + object.error + '</div>' : '';

    var widget = object.widget.toHTML(name, object);
    return '<div class="form-group">' + label + widget + error + '</div>';
};

const createPosterForm = (media_properties, tags) => {
    return forms.create({
        'title' : fields.string({
            required: true,
            errorAfterField: true
        }),
        'cost': fields.string({
            required: true,
            errorAfterField: true,
            'validators':[validators.integer(), validators.min(0)]
        }),
        'description' : fields.string({
            required: true,
            errorAfterField: true
        }),
        'date' : fields.string({
            required: true,
            errorAfterField: true,
            widget: widgets.date()
        }),
        'stock' : fields.string({
            required: true,
            errorAfterField: true
        }),
        'height' : fields.string({
            required: true,
            errorAfterField: true,
            'validators':[validators.integer(), validators.min(0)]
        }),
        'width' : fields.string({
            required: true,
            errorAfterField: true,
            'validators':[validators.integer(), validators.min(0)]
        }),
        'media_property_id' : fields.string({
            label: 'Media Property',
            required: true,
            errorAfterField: true,
            widget: widgets.select(),
            choices: media_properties
        }),
        'tags' : fields.string({
            required: true,
            errorAfterField: true,
            widget: widgets.multipleSelect(),
            choices: tags
        })
    })
}

module.exports = {createPosterForm, bootstrapField}