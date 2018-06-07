'use strict';
const express = require('express');
const router = express.Router();
const passport = require('passport')

// ----- auth imports -----
const { localStrategy, jwtStrategy } = require('../config/passport');

// ----- activate authentication -----
passport.use(localStrategy);
passport.use(jwtStrategy);

// ---- import routes -----
const { router: authRoute } = require('./authRoute');
const { router: songsRoute } = require('./songsRoute');
const { router: usersRoute } = require('./usersRoute');
const { router: setsRoute } = require('./setsRoute');

// ----- user and auth routes -----
router.use('/auth', authRoute); // serves a JWT, requires login info, uses localauth
router.use('/users', usersRoute); // signup a new user

// ----- api routes -----
router.use('/api/songs', songsRoute); // access songs database, need jwt
router.use('/api/review/sets', setsRoute); // access sets database, need jwt

// ---- views routes -----
/* router.get('/', (req, res) => {
    console.log('generate a view');
    res.send('login page');
});

router.get('/register', (req, res) => {
    console.log('generate a view');
    res.send('register page');
});

router.get('/dashboard', (req, res) => {
    console.log('generate a view');
    res.send('dashboard page');
});

router.get('/recommendations', (req, res) => {
    console.log('generate a view');
    res.send('recommendations page');
});

router.get('/myprofile', (req, res) => {
    console.log('generate a view');
    res.send('myprofile page');
});

router.get('/review', (req, res) => {
    console.log('generate a view');
    res.send('review page');
});

router.get('/about', (req, res) => {
    console.log('generate a view');
    res.send('about page');
}); */

module.exports = { router };