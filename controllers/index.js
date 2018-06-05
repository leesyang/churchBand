'use strict';
const { router: authCtrl } = require('./authCtrl');
const { router: songsCtrl } = require('./songsCtrl');
const { router: usersCtrl } = require('./usersCtrl');
const { router: setsCtrl } = require('./setsCtrl');

module.exports = { authCtrl, songsCtrl, usersCtrl, setsCtrl };