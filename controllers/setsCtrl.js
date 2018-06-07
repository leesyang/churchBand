'use strict';
const { Set } = require('../models');
const setsCtrl = {};

setsCtrl.console = function (req, res) {
    console.log('sets controller is working');
}

module.exports = setsCtrl;