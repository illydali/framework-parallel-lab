const express = require('express');
const router = express.Router();

const {
    User
} = require('../models');

const {
    bootstrapField,
    createLoginForm,
    createRegistrationForm,
} = require('../forms');
const { Router } = require('express');

router.get('/register', (req, res) => {
    // display reg form
    const register = createRegistrationForm();
    res.render('users/register', {
        'form': register.toHTML(bootstrapField)
    })
})

router.post('/register', async (req, res) => {
    const registerForm = createRegistrationForm();
    registerForm.handle(req, {
        'success': async (form) => {
            const user = new User({
                'username': form.data.username,
                'password': form.data.password,
                'email': form.data.email
            });
            await user.save();
            req.flash("success_messages", "User signed up successfully!");
            res.redirect('/users/login')
        },
        'error': (form) => {
            // display validation errors to user
            res.render('users/register', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})


router.get('/login', (req,res)=>{
    const loginForm = createLoginForm();
    res.render('users/login', {
        'form': loginForm.toHTML(bootstrapField)
    })
})

router.post('/login', async (req,res) => {
    const loginForm = createLoginForm();
    loginForm.handle(req, {
        'success': async (form) => {
            // process the login
            let user = await User.where({
                'email': form.data.email
            }).fetch({
                require: false
            });

            if (!user) {
                req.flash('error_messages', 'Sorry, user is not registered')
                res.redirect('/users/login');
            } else {
                // check if password matches
                if (user.get('password') === form.data.password) {
                    // add to the session that login successful
                    // store the user details
                    req.session.user = {
                        id: user.get('id'),
                        username: user.get('username'),
                        email: user.get('email')
                    }
                    req.flash("success_messages", "Welcome back, " + user.get('username'))
                    res.redirect('/users/profile');
                } else {
                    req.flash("error_messages", "Sorry, the email or password is incorrect.")
                    res.redirect('/users/login')
                }
            }
        }, 
        error : (form) => {
            req.flash('error_messages', "There are some problems logging you in. Please re-enter details")
            res.render('users/login', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

router.get('/profile', (req, res) => {
    const user = req.session.user;
    if (!user) {
        req.flash('error_messages', 'You do not have permission to view this page');
        res.redirect('/users/login');
    } else {
        res.render('users/profile',{
            'user': user
        })
    }


})

router.get('/logout', (req, res) => {
    req.session.user = null;
    req.flash('success_messages', "See you again!");
    res.redirect('/users/login');
})

module.exports = router;