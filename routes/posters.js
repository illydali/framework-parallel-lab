const express = require("express");
const router = express.Router();

// #1 import in the Product model
const {
    Poster
} = require('../models')

// import in forms
const {
    bootstrapField,
    createPosterForm
} = require('../forms');

// create function to get product by id from mysql since this will be used repeatedly especially
// when doing CRUD
async function getPosterId(posterId) {
    // eqv of
    // select * from products where id = ${productId}
    const poster = await Poster.where({
        'id': posterId
    }).fetch({
        'require': true, // will cause an error if not found
    })
    return poster;
}


router.get('/', async (req, res) => {
    // #2 - fetch all the products (ie, SELECT * from products)
    let posters = await Poster.collection().fetch();
    res.render('posters/index', {
        'posters': posters.toJSON() // #3 - convert collection to JSON
    })
})

router.get('/create', async (req, res) => {
    const posterForm = createPosterForm();
    res.render('posters/create', {
        'form': posterForm.toHTML(bootstrapField)
    })
})

router.post('/create', async (req, res) => {
    const posterForm = createPosterForm();
    posterForm.handle(req, {
        'success': async (form) => {
            const poster = new Poster();
            poster.set('title', form.data.title);
            poster.set('cost', form.data.cost);
            poster.set('description', form.data.description);
            poster.set('stock', form.data.stock);
            poster.set('height', form.data.height);
            poster.set('width', form.data.width);
            poster.set('date', form.data.date);

            await poster.save();
            res.redirect('/posters')
        },
        'error': async (form) => {
            res.render('products/create', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

router.get('/:id/update', async (req, res) => {
    // retrieve the product
    const poster = await getPosterId(req.params.id)

    const posterForm = createPosterForm();

    // fill in the existing values
    posterForm.fields.title.value = poster.get('title');
    posterForm.fields.cost.value = poster.get('cost');
    posterForm.fields.description.value = poster.get('description');
    posterForm.fields.date.value = poster.get('date');
    posterForm.fields.stock.value = poster.get('stock');
    posterForm.fields.height.value = poster.get('height');
    posterForm.fields.width.value = poster.get('width');

    res.render('posters/update', {
        'form': posterForm.toHTML(bootstrapField),
        'poster': poster.toJSON()
    })



})

router.post('/:id/update', async (req, res) => {
    const poster = await getPosterId(req.params.id)

    // process the form
    const posterForm = createPosterForm();

    posterForm.handle(req, {
        'success': async (form) => {
            poster.set(form.data);
            poster.save();
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

router.get('/:id/delete', async(req,res)=>{
    // fetch the product that we want to delete
    const poster = await getPosterId(req.params.id)

    res.render('posters/delete', {
        'poster': poster.toJSON()
    })

});

router.get('/:id/delete', async(req,res)=>{
    // fetch the product that we want to delete
    const poster = await getPosterId(req.params.id)

    await poster.destroy(); 
    res.redirect('./posters')

});

module.exports = router;