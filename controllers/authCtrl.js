'use strict';
// ----- constants -----
const { JWT_SECRET, JWT_EXPIRY } = require('../config/constants');
const jwt = require('jsonwebtoken');
const authCtrl = {};

// ----- json web token -----
const createAuthToken = function(user) {
    return jwt.sign({user}, JWT_SECRET, {
        algorithm: 'HS256',
        expiresIn: JWT_EXPIRY,
    });
};

authCtrl.login = function (req, res) {
    let authToken = createAuthToken(req.user);
    res.cookie('authToken', authToken);
    res.status(201).json({ code: 201, message: 'Successful login', authToken: authToken });
}

authCtrl.logout = function (req, res) {
    res.clearCookie('authToken');
    res.redirect('/');
}


module.exports = authCtrl;