// import in caolan forms
const forms = require("forms");
// create some shortcuts
const fields = forms.fields;
const validators = forms.validators;

let bootstrapField = function (name, object) {
    if (!Array.isArray(object.widget.classes)) { object.widget.classes = []; }

    if (object.widget.classes.indexOf('form-control') === -1) {
        object.widget.classes.push('form-control');
    }

    let validationclass = object.value && !object.error ? 'is-valid' : '';
    validationclass = object.error ? 'is-invalid' : validationclass;
    if (validationclass) {
        object.widget.classes.push(validationclass);
    }

    let label = object.labelHTML(name);
    let error = object.error ? '<div class="invalid-feedback">' + object.error + '</div>' : '';

    let widget = object.widget.toHTML(name, object);
    return '<div class="form-group">' + label + widget + error + '</div>';
};

const createPosterForm = () => {
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
            errorAfterField: true
        }),
        'stock' : fields.string({
            required: true,
            errorAfterField: true
        }),
        'height' : fields.string({
            required: true,
            errorAfterField: true
        }),
        'width' : fields.string({
            required: true,
            errorAfterField: true
        }),
    })
}

module.exports = {createPosterForm, bootstrapField}