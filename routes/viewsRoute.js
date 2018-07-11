'use strict';
const router = require('express').Router();

// ---- authentication -----
const { jwtAuth } = require('../middlewares/auth');

// ----- controllers -----
const { viewsCtrl } = require('../controllers')

// ----- routes -----
router.get('/', viewsCtrl.login);

router.get('/register', viewsCtrl.register);

router.get('/home', jwtAuth, viewsCtrl.home)

module.exports = { router };