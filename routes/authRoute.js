'use strict';
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const urlParser = bodyParser.urlencoded({ type: 'application/x-www-form-urlencoded', extended: true });
const jwt = require('jsonwebtoken');

// ----- constants -----
const { JWT_SECRET, JWT_EXPIRY } = require('../config/constants')

// ----- authentication -----
const { localAuth, jwtAuth } = require('../middlewares/auth');

// ----- controllers -----
const { authCtrl } = require('../controllers');

// ----- middleware -----
router.use(jsonParser);
router.use(urlParser);

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
router.post('/login', urlParser, localAuth, (req, res) => {
    let authToken = createAuthToken(req.user);
    res.cookie('authToken', authToken);
    res.status(200).end();
});

/*
/// --- get a new token with current token ---
router.get('/refresh', jwtAuth, (req, res) => {
    console.log(req.user);
    res.send('refresh token working');
}) */

module.exports = { router };