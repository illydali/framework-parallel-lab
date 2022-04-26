const express = require("express");
const router = express.Router();

// #1 import in the model
const {
    Poster,
    Media_Property,
    Tag
} = require('../models')

// import in forms
const {
    bootstrapField,
    createPosterForm,
    createSearchForm
} = require('../forms');

// import in the CheckIfAuthenticated middleware
const {
    checkIfAuthenticated
} = require('../middlewares');

const dataLayer = require('../dal/posters')

router.get('/', async (req, res) => {

    // let posters = await Poster.collection().fetch({
    //     withRelated: ['media_property', 'tags']
    // });
    // res.render('posters/index', {
    //     'posters': posters.toJSON()
    // })

    // 1. get all the categories
    const allProps= await dataLayer.getAllProperties()
    allProps.unshift([0, 'All']);


    // 2. Get all the tags
    const allTags = await dataLayer.getAllTags()

    // 3. Create search form 
    const searchForm = createSearchForm(allProps, allTags);

    // 1. Begin with an always true query
    // ... creating a query object ( a query object represents one SQL staetement)
    // this is just a query and has not been executed yet
    let q = Poster.collection(); // eqv to the query "SELECT * FROM posters WHERE 1"

    searchForm.handle(req, {
        'empty': async (form) => {
            let posters = await q.fetch({
                withRelated: ['media_property', 'tags']
            })

            res.render('posters/index', {
                'searchForm': form.toHTML(bootstrapField),
                'posters': posters.toJSON()

            })
        },
        'error': async (form) => {
            let posters = await q.fetch({
                withRelated: ['media_property', 'tags']
            })

            res.render('posters/index', {
                'searchForm': form.toHTML(bootstrapField),
                'posters': posters.toJSON()

            })
        },
        'success': async (form) => {
            // 2. check if the user has provided any search parameters
            if (form.data.title) {
                q.where('title', 'like', '%' + form.data.title + '%');
            }

            if (form.data.min_cost) {
                q.where('cost', '>=', form.data.min_cost);
            }

            if (form.data.max_cost) {
                q.where('cost', '<=', form.data.max_cost);
            }

            if (form.data.max_height) {
                q.where('height' , '<=' , form.data.max_height)
            }

            if (form.data.media_property_id && form.data.media_property_id != '0') {
                q.where('media_property_id', '=', form.data.media_property_id)
            }

            if (form.data.tags) {
                // joining in bookshelf:
                q.query('join', 'posters_tags', 'posters.id', 'poster_id')
                    .where('tag_id', 'in', form.data.tags.split(','))
                // eqv:
                // SELECT * FROM posters JOIN posters_tags ON posters.id = poster_id
                // WHERE tag_id in (1,4)
            }

            // 3. execute the query and fetch the results
            let posters = await q.fetch({
                withRelated: ['media_property', 'tags']
            }); // execute the query

            res.render('posters/index', {
                'posters': posters.toJSON(),
                'searchForm': form.toHTML(bootstrapField)
            })
        }
    })
})

router.get('/create', checkIfAuthenticated, async (req, res) => {

    const allProps = await dataLayer.getAllProperties();
    const allTags = await dataLayer.getAllTags();
    const posterForm = createPosterForm(allProps, allTags);
    res.render('posters/create', {
        'form': posterForm.toHTML(bootstrapField),
        cloudinaryName: process.env.CLOUDINARY_NAME,
        cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
        cloudinaryPreset: process.env.CLOUDINARY_UPLOAD_PRESET
    })
})

router.post('/create', checkIfAuthenticated, async (req, res) => {

    const allProps = await dataLayer.getAllProperties();
    const allTags = await dataLayer.getAllTags();
    const posterForm = createPosterForm(allProps, allTags);
    posterForm.handle(req, {
        'success': async (form) => {
            let {
                tags,
                ...posterData
            } = form.data

            const poster = new Poster(posterData);
            // poster.set('title', form.data.title);
            // poster.set('cost', form.data.cost);
            // poster.set('description', form.data.description);
            // poster.set('stock', form.data.stock);
            // poster.set('height', form.data.height);
            // poster.set('width', form.data.width);
            // poster.set('date', form.data.date);
            // poster.set('media_property_id', form.data.media_property_id)

            await poster.save();

            if (tags) {
                await poster.tags().attach(tags.split(','))
            }
            req.flash("success_messages", `New Poster ${poster.get('title')} has been created`)
            res.redirect('/posters')
        },
        'error': async (form) => {
            res.render('posters/create', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

router.get('/:id/update', async (req, res) => {
    const allProps = await dataLayer.getAllProperties();
    const allTags = await dataLayer.getAllTags();
    // retrieve the poster
    const poster = await dataLayer.getPosterId(req.params.id)

    const posterForm = createPosterForm(allProps, allTags);

    // fill in the existing values
    posterForm.fields.title.value = poster.get('title');
    posterForm.fields.cost.value = poster.get('cost');
    posterForm.fields.description.value = poster.get('description');
    posterForm.fields.date.value = poster.get('date');
    posterForm.fields.stock.value = poster.get('stock');
    posterForm.fields.height.value = poster.get('height');
    posterForm.fields.width.value = poster.get('width');
    posterForm.fields.media_property_id.value = poster.get('media_property')

    // 1 - set the image url in the poster form
    posterForm.fields.image_url.value = poster.get('image_url');


    let selectedTags = await poster.related('tags').pluck('id');
    posterForm.fields.tags.value = selectedTags

    res.render('posters/update', {
        'form': posterForm.toHTML(bootstrapField),
        'poster': poster.toJSON(),
        // 2 - send to the HBS file the cloudinary information
        cloudinaryName: process.env.CLOUDINARY_NAME,
        cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
        cloudinaryPreset: process.env.CLOUDINARY_UPLOAD_PRESET
    })
})

router.post('/:id/update', async (req, res) => {
    const allProps = await dataLayer.getAllProperties();
    const allTags = await dataLayer.getAllTags();
    const poster = await dataLayer.getPosterId(req.params.id)
    // process the form
    const posterForm = createPosterForm(allProps, allTags);

    posterForm.handle(req, {
        'success': async (form) => {
            let {
                tags,
                ...posterData
            } = form.data
            poster.set(posterData);
            poster.save();

            // update the tags 
            let tagIds = tags.split(',');
            let existingTagIds = await poster.related('tags').pluck('id');

            // remove all the tags that arent selected
            let toRemove = existingTagIds.filter(id => tagIds.includes(id) === false)
            await poster.tags().detach(toRemove);

            // add in all the tags selected in the form 
            await poster.tags().attach(tagIds);

            res.redirect('/posters');
        },
        'error': async (form) => {
            res.render('posters/update', {
                'form': form.toHTML(bootstrapField),
                'poster': poster.toJSON()
            })
        }
    })
})

router.get('/:id/delete', async (req, res) => {
    // fetch the poster that we want to delete
    const poster = await dataLayer.getPosterId(req.params.id)

    res.render('posters/delete', {
        'poster': poster.toJSON()
    })

});

router.post('/:id/delete', async (req, res) => {
    // fetch the poster that we want to delete
    const poster = await dataLayer.getPosterId(req.params.id)

    await poster.destroy();
    res.redirect('/posters')

});

module.exports = router;