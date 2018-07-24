'use strict';
const router = require('express').Router();

// ----- authentication -----
const { localAuth, jwtAuthViews } = require('../middlewares/auth');

// ----- controllers -----
const { authCtrl } = require('../controllers');

// ----- routes -----

router.post('/login', localAuth, authCtrl.login);

router.get('/logout', authCtrl.logout);

module.exports = { router };