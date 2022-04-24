const express = require('express');
const router = express.Router();

const CartServices = require('../services/cart_services')
const Stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

router.get('/', async (req, res) => {
    const cart = new CartServices(req.session.user.id);

    // get all the items from the cart
    let items = await cart.getCart();

    // step 1 - create line items
    let lineItems = [];
    let meta = [];
    for (let item of items) {
        const lineItem = {
            'name': item.related('poster').get('title'),
            'amount': item.related('poster').get('cost'),
            'quantity': item.get('quantity'),
            'currency': 'SGD'
        }
        if (item.related('poster').get('image_url')) {
            lineItem['images'] = [item.related('poster').get('image_url')]
        }
        lineItems.push(lineItem);
        // save the quantity data along with the poster id
        meta.push({
            'poster_id' : item.get('poster_id'),
            'quantity': item.get('quantity')
        })
    }

    // step 2 - create stripe payment
    let metaData = JSON.stringify(meta);
    const payment = {
        payment_method_types: ['card'],
        line_items: lineItems,
        success_url: process.env.STRIPE_SUCCESS_URL + '?sessionId={CHECKOUT_SESSION_ID}',
        cancel_url: process.env.STRIPE_ERROR_URL,
        metadata: {
            'orders': metaData
        }
    }

    // step 3: register the session
    let stripeSession = await Stripe.checkout.sessions.create(payment)
    console.log(payment)
    res.render('checkout/checkout', {
        'sessionId': stripeSession.id, // 4. Get the ID of the session
        'publishableKey': process.env.STRIPE_PUBLISHABLE_KEY
    })
})

router.get('/success', function(req,res){
    res.render('checkout/success')
})

router.get('/cancelled', function(req,res){
    res.render('checkout/cancelled')
})

// this is the webhook route
// stripe will send a POST request to this route when a
// payment is completed
router.post('/process_payment', express.raw({
    'type':'application/json'
}), function(req,res){
    let payload = req.body;
    let endpointSecret = process.env.STRIPE_ENDPOINT_SECRET;
    let sigHeader = req.headers["stripe-signature"];
    let event;
    try {
        event = Stripe.webhooks.constructEvent(payload, sigHeader, endpointSecret);
    } catch(e) {
        res.send({
            "error": e.message
        })
    }
    console.log(event)
    if (event.type === 'checkout.session.completed') {
        let stripeSession = event.data.object;
        console.log(stripeSession);
        console.log(stripeSession.metadata);
    }
    res.send({
        'received': true
    })
})

module.exports = router;
