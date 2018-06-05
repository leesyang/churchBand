'use strict';
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

router.use('/', (req,res) => {
    console.log('getting authCtrl');
});

module.exports = { router };