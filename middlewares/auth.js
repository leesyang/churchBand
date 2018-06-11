'use strict';
const passport = require('passport');

const localAuth = passport.authenticate('local', {session: false});
const jwtAuth = passport.authenticate('jwt', {session: false});

module.exports = { localAuth, jwtAuth };