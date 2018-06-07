'use strict';
// ----- auth strategies -----
const { localStrategy } = require('../config/passport');

const authCtrl = {};

authCtrl.console = function(res, req) {
    console.log('auth control working');
};


module.exports = authCtrl;