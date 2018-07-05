'use strict';
const passport = require('passport');

const localAuth = function (req, res, next) {
    passport.authenticate('local', { session: false }, function(err, user, info) {
        if (err) { return next(err) };
        if (info) { return res.status(422).json(info) };
        if (!user) { return res.redirect('/') };
        req.logIn(user, function(err) {
          if (err) { return next(err); }
          return next();
        });
      })(req, res, next);
};

const jwtAuth = passport.authenticate('jwt', { session: false, failureRedirect: '/' });

module.exports = { localAuth, jwtAuth };