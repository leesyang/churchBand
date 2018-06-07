'use strict';
const passport = require('passport');

const auth = {};

auth.localAuth = passport.authenticate('local', {session: false});
auth.jwtAuth = passport.authenticate('jwt', {session: false});

module.exports = auth;