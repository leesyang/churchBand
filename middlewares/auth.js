'use strict';
const passport = require('passport');

const localAuth = passport.authenticate('local', { successRedirect:'/home', failureRedirect: '/', failureFlash: true });
const jwtAuth = passport.authenticate('jwt', { session: false, failureRedirect: '/' });

module.exports = { localAuth, jwtAuth };