const express = require('express')
const router = express.Router();

const posterDataLayer = require('../../dal/posters')

const {
    Poster
} = require('../../models')
const {
    createPosterForm
} = require('../../forms')

router.get('/', async (req, res) => {
    res.send(await posterDataLayer.getAllPosters())
})

router.post('/', async (req, res) => {
    try {
        const allProps = await posterDataLayer.getAllProperties();
        const allTags = await posterDataLayer.getAllTags();
        const posterForm = createPosterForm(allProps, allTags);

        posterForm.handle(req, {
            'success': async (form) => {
                let {
                    tags,
                    ...posterData
                } = form.data;
                const poster = new Poster(posterData);
                await poster.save();

                // save the many to many relationship
                if (tags) {
                    await poster.tags().attach(tags.split(","));
                }
                res.send(poster);
            },
            'error': async (form) => {
                // manually extact out the errors from the caolan
                // form and send it back as JSON
                let errors = {};
                for (let key in form.fields) {
                    if (form.fields[key].error) {
                        errors[key] = form.fields[key].error;
                    }
                }
                res.send(JSON.stringify(errors));
            }
        })
    } catch (e) {
        console.log(e);
        res.status(500);
        res.send({
            'error': e
        });
    }
})

module.exports = router;