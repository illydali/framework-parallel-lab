const express = require('express')
const router = express.Router();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { User } = require('../../models')
const { checkIfAuthenticatedJWT } = require('../../middlewares');

const getHashedPassword = (password) => {
    const sha256 = crypto.createHash('sha256');
    const hash = sha256.update(password).digest('base64');
    return hash;
}

const generateToken = (user, secret, expiry) => {
    // three arguments:
    // arg 1: JWT payload
    // arg 2: token secret
    // arg 3: configuration expiration object
    return jwt.sign({
        'username': user.username,
        'id': user.id,
        'email': user.email
    }, secret,{
        'expiresIn': expiry // w for weeks, m for minutes, s for seconds
    });
}

router.post('/login', async (req, res) => {
    let user = await User.where({
        'email': req.body.email
    }).fetch({
        require: false
    });

    console.log(req.body.email)
    console.log(req.body.password)
    console.log(user.get('password'))
    if (user && user.get('password') == getHashedPassword(req.body.password)) {
        let accessToken = generateToken(user.toJSON(), process.env.TOKEN_SECRET, "1h");
        res.send({
            'accessToken': accessToken
        })
    } else {
        res.status(500),
        res.send({
            'error':'Wrong email or password'
        })
    }
})

router.get('/profile', checkIfAuthenticatedJWT, async(req,res)=>{
    const user = req.user;
    res.send(user);
})

module.exports = router