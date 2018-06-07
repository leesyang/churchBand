'use strict';
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const passport = require('passport');
const jwt = require('jsonwebtoken');

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
    let authToken = createAuthToken(req.user);
    res.json({ authToken: authToken });
})
/// --- get a new token with current token ---
router.post('/refresh', jwtAuth, (req, res) => {
    console.log('refresh token working');
})

module.exports = { router };