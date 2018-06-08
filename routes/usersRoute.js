'use strict';
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
mongoose.Promise = global.Promise;

// ----- controllers -----
const { usersCtrl } = require('../controllers');

// ----- imports -----
const { User } = require('../models');

// ----- middleware -----
router.use(jsonParser);
const { newUserInputCheck } = require('../middlewares');

// ----- routes -----
// -- create new user --
router.post('/', newUserInputCheck, usersCtrl.addNewUser );

module.exports = { router };