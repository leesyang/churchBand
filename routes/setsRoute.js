'use strict';
const express = require('express');
const router = express.Router();
const passport = require('passport');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

// ----- controllers -----
const { setsCtrl } = require('../controllers');

router.get('/', (req,res) => {
    console.log('getting worshipSetsCtrl');
});

module.exports = { router };