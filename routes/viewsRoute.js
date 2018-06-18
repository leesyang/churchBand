'use strict';
const express = require('express');
const router = express.Router();

// ---- authentication -----
const { jwtAuth } = require('../middlewares/auth');

// ----- controllers -----
const { viewsCtrl } = require('../controllers')

// ----- routes -----
router.get('/', viewsCtrl.login);

router.get('/register', viewsCtrl.register);

router.get('/home', viewsCtrl.home)

module.exports = { router };