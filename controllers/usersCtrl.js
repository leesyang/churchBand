'use strict';
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

router.get('/', (req,res) => {
    console.log('getting usersCtrl');
});

module.exports = { router };