'use strict';
const passport = require('passport');

/* const localAuth =  function() {
    passport.authenticate('local', {session: false});
};

const jwtAuth = function() {
    passport.authenticate('jwt', {session: false});
}; */

const localAuth = passport.authenticate('local', {session: false});
const jwtAuth = passport.authenticate('jwt', {session: false});

const isCurrentUser = function(req, res, next) {
    console.log('hi');
};

const isLoggedIn = function(req, res, next) {
    console.log('hi');
};

// module.exports = { localAuth, jwtAuth };
module.exports = { isCurrentUser, isLoggedIn, localAuth, jwtAuth };