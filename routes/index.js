'use strict';
const router = require('express').Router();
const cookieParser = require('cookie-parser');

// ----- cookies -----
router.use(cookieParser());

// ---- import routes -----
const { router: authRoute } = require('./authRoute');
const { router: songsRoute } = require('./songsRoute');
const { router: usersRoute } = require('./usersRoute');
const { router: setsRoute } = require('./setsRoute');
const { router: viewsRoute } = require('./viewsRoute');

// ----- user and auth routes -----
router.use('/auth', authRoute); // serves a JWT, requires login info, uses localauth
router.use('/users', usersRoute); // signup a new user

// ----- api routes -----
router.use('/api/songs', songsRoute); // access songs database, need jwt
router.use('/api/review/sets', setsRoute); // access sets database, need jwt

// ---- views routes -----
router.use('/', viewsRoute);

module.exports = { router };