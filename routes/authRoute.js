'use strict';
const router = require('express').Router();

// ----- authentication -----
const { localAuth, jwtAuth } = require('../middlewares/auth');

// ----- controllers -----
const { authCtrl } = require('../controllers');

// ----- routes -----

router.post('/login', localAuth, authCtrl.login);

router.get('/logout', jwtAuth, authCtrl.logout);

module.exports = { router };