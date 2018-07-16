'use strict';
require('dotenv').config()
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const favicon = require('serve-favicon');
mongoose.Promise = global.Promise;
const passport = require('passport');

// ----- constants -----
const { DATABASE_URL, PORT } = require('./config/constants');
const { localStrategy, jwtStrategy } = require('./config/passport');

// ----- imports -----
const { router } = require('./routes');

const app = express();

// ----- CORS -----
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
  if (req.method === 'OPTIONS') {
    return res.send(204);
  }
  next();
});

// ----- favicon -----
app.use(favicon(__dirname + '/public/images/icons/' + 'favicon.ico'));

// ---- static files -----
app.use(express.static(__dirname + '/public'));

// ----- http logging -----
app.use(morgan('common'));

// ----- passport -----
app.use(passport.initialize());
passport.use('local-login', localStrategy);
passport.use('jwt-protected', jwtStrategy);

// ----- views -----
app.set('view engine', 'ejs');

// ----- routes -----
app.use('/', router);


// ----- server -----
let server;

function runServer(databaseUrl, port = PORT) {

  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
        .on('error', err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
};

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
};

if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
};