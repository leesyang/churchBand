'use strict';
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const urlParser = bodyParser.urlencoded({ type: 'application/x-www-form-urlencoded', extended: true });
mongoose.Promise = global.Promise;

// ----- controllers -----
const { usersCtrl } = require('../controllers');

// ----- imports -----
const { User } = require('../models');

// ----- middleware -----
router.use(jsonParser);
router.use(urlParser);
const { newUserInputCheck } = require('../middlewares/fieldReqCheck');

// ----- routes -----
// -- create new user --
router.post('/', urlParser, newUserInputCheck, usersCtrl.addNewUser );

module.exports = { router };