'use strict';
const router = require('express').Router();
const mongoose = require('mongoose');
const jsonParser = require('body-parser').json();
mongoose.Promise = global.Promise;

// ----- controllers -----
const { usersCtrl } = require('../controllers');

// ----- imports -----
const { User } = require('../models');

// ----- middleware -----
router.use(jsonParser);
const { newUserInputCheck } = require('../middlewares/fieldReqCheck');

// ----- routes -----
// -- create new user --
router.post('/', newUserInputCheck, usersCtrl.addNewUser );

module.exports = { router };