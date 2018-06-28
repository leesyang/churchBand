'use strict';
const router = require('express').Router();
const jsonParser = require('body-parser').json();
const jwt = require('jsonwebtoken');
const passport = require('passport');

// ----- constants -----
const { JWT_SECRET, JWT_EXPIRY } = require('../config/constants')

// ----- authentication -----
const { localAuth, jwtAuth } = require('../middlewares/auth');

// ----- controllers -----
const { authCtrl } = require('../controllers');

// ----- middleware -----
router.use(jsonParser);

// ----- json web token -----
/// --- generates a jwt token ---
const createAuthToken = function(user) {
    return jwt.sign({user}, JWT_SECRET, {
        algorithm: 'HS256',
        expiresIn: JWT_EXPIRY,
    });
};

// ----- routes -----
/// --- login with username and password ---
router.post('/login', localAuth, (req, res) => {
    console.log('Successful login');
    let authToken = createAuthToken(req.user);
    res.cookie('authToken', authToken);
    res.status(201).json({ code: 201, message: 'Successful login', authToken: authToken });
});

router.get('/logout', jwtAuth, (req, res) => {
    res.clearCookie('authToken');
    res.redirect('/');
})


/*
/// --- get a new token with current token ---
router.get('/refresh', jwtAuth, (req, res) => {
    console.log(req.user);
    res.send('refresh token working');
}) */

module.exports = { router };