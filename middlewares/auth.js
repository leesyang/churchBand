'use strict';
const passport = require('passport');

const localAuth = function (req, res, next) {
    passport.authenticate('local-login', { session: false }, function(err, user, info) {
        if (err) { return next(err) };
        if (info) { return res.status(422).json(info) };
        if (!user) { return res.redirect('/') };
        req.logIn(user, function(err) {
          if (err) { return next(err); }
          return next();
        });
      })(req, res, next);
};

const jwtAuth = passport.authenticate('jwt-protected', { session: false });
const jwtAuthViews = passport.authenticate('jwt-protected', { session: false, failureRedirect: '/' });

module.exports = { localAuth, jwtAuth, jwtAuthViews };