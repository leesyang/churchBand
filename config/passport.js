'use strict';
const mongoose = require('mongoose');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
mongoose.Promise = global.Promise;

// ----- constants -----
const { JWT_SECRET, JWT_EXPIRY } = require('./constants');

// ----- imports -----
const { User } = require('../models');

// ----- local strategy -----
const localStrategy = new LocalStrategy(
    function (username, password, callback) {
    let user;
    User.findOne({ username: username })
      .then(_user => {
        user = _user;
        if (!user) {
          return Promise.reject({
            reason: 'LoginError',
            message: 'Incorrect username or password'
          });
        }
        return user.validatePassword(password);
      })
      .then(isValid => {
        if (!isValid) {
          return Promise.reject({
            reason: 'LoginError',
            message: 'Incorrect username or password'
          });
        }
        return callback(null, user.serialize());
      })
      .catch(err => {
        if (err.reason === 'LoginError') {
          return callback(null, false, err);
        }
        return callback(err, false);
      });
  });

// ----- cookie extractor -----
const cookieExtractor = function(req) {
    var token = null;
    if (req && req.cookies)
    {
        token = req.cookies['authToken'];
    }
    return token;
};

// ----- jwt strategy -----
const jwtStrategy = new JwtStrategy(
    {
        secretOrKey: JWT_SECRET,
        // Look for the JWT as a Bearer auth header
        jwtFromRequest: cookieExtractor,
        // Only allow HS256 tokens - the same as the ones we issue
        algorithms: ['HS256']
      },
      (payload, done) => {
        done(null, payload.user);
      }
);

module.exports = { localStrategy, jwtStrategy };