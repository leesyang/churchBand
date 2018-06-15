'use strict';
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
mongoose.Promise = global.Promise;

// ----- constants -----
const { DATABASE_URL, PORT } = require('./config/constants');

// ----- imports -----
const { router } = require('./routes');

const app = express();

// ----- http logging -----
app.use(morgan('common'));

// ---- sessions -----
const sessConfig = {
  secret: 'thinkful',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: null }
};
app.use(session(sessConfig));

// ----- activate passport -----
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// ----- routes -----
app.use('/', router);

// ---- static files -----
app.use(express.static(__dirname + '/public'));

// ----- views -----
app.set('view engine', 'ejs');

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