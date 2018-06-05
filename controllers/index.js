'use strict';
const { router: authCtrl } = require('./authCtrl');
const { router: recommSongsCtrl } = require('./recommSongsCtrl');
const { router: usersCtrl } = require('./usersCtrl');
const { router: worshipSetsCtrl } = require('./worshipSetsCtrl');

module.exports = { authCtrl, recommSongsCtrl, usersCtrl, worshipSetsCtrl };