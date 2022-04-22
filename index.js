const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
const cors = require("cors")
require("dotenv").config();

// adding flash and sessions
const session = require('express-session');
const flash = require('connect-flash');
const FileStore = require('session-file-store')(session);

// import in csurf
const csrf = require('csurf')

// create an instance of express app
const app = express();

// set the view engine
app.set("view engine", "hbs");

// static folder
app.use(express.static("public"));

// setup wax-on
wax.on(hbs.handlebars);
wax.setLayoutPath("./views/layouts");

// enable forms
app.use(
    express.urlencoded({
        extended: false
    })
);

// custom middlewares
app.use(function(req,res,next){
    // declare a varianle named
    // date that is available for
    // all hbs file to access
    res.locals.date = Date();

    next(); // forward the request to the next middleware
            // or if there is no middleware,to the intended route function
})

app.use(cors()); // make sure to enable cors before sessions

// set up sessions
app.use (session ({
    store: new FileStore(),
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: true
}))

// set up flash messages
app.use(flash()) 

// Register Flash middleware
app.use(function (req, res, next) {
    res.locals.success_messages = req.flash("success_messages");
    res.locals.error_messages = req.flash("error_messages");
    next();
})

// Share the user data with all hbs files
app.use(function(req,res,next){
    res.locals.user = req.session.user;
    next();
})

// app.use(csrf());
const csurfInstance = csrf();  // creating a prox of the middleware
app.use(function(req,res,next){
    // if it is webhook url, then call next() immediately
    // or if the url is for the api, then also exclude from csrf
    if (req.url === '/checkout/process_payment' || 
        req.url.slice(0,5)=='/api/') {
        next();
    } else {
        csurfInstance(req,res,next);
    }
})

// middleware to handle csrf errors
// if a middleware function takes 4 arguments
// the first argument is error
app.use(function (err, req, res, next) {
    if (err && err.code == "EBADCSRFTOKEN") {
        req.flash('error_messages', 'The form has expired. Please try again');
        res.redirect('back'); // go back one page
    } else {
        next()
    }
});

// Share CSRF with hbs files
// the req.csrfToken() generates a new token
// and save it to the current session
app.use(function(req,res,next){
    if (req.csrfToken) {
        res.locals.csrfToken = req.csrfToken();
    }
    next();
})

// importing routes in 
const landingRoutes = require('./routes/landing')
const posterRoutes = require('./routes/posters')
const userRoutes = require('./routes/users')
const cloudinaryRoutes = require('./routes/cloudinary')
const cartRoutes = require('./routes/shoppingCart')
const checkoutRoutes = require('./routes/checkout');
const { checkIfAuthenticated } = require("./middlewares");
const api = {
    posters: require('./routes/api/posters'),
    users: require('./routes/api/users')
}


async function main() {

    app.get('/', function(req,res){
        res.redirect('/landing');
    })

    app.use('/landing', landingRoutes)
    app.use('/posters', posterRoutes)
    app.use('/users', userRoutes)
    app.use('/cloudinary', cloudinaryRoutes)
    app.use('/cart', checkIfAuthenticated, cartRoutes)
    app.use('/checkout', checkoutRoutes)
    app.use('/api/posters', express.json() ,api.posters)
    app.use('/api/users', express.json(), api.users)
}

main();

app.listen(3001, () => {
    console.log("Server has started");
});