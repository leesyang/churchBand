'use strict';
const router = require('express').Router();
const cookieParser = require('cookie-parser');
const jsonParser = require('body-parser').json();

// ----- cookies -----
router.use(cookieParser());
router.use(jsonParser);

// ---- import routes -----
const 
    { router: authRoute } = require('./authRoute'),
    { router: songsRoute } = require('./songsRoute'),
    { router: usersRoute } = require('./usersRoute'),
    { router: setsRoute } = require('./setsRoute'),
    { router: viewsRoute } = require('./viewsRoute');

// ----- user and auth routes -----
router.use('/auth', authRoute);
router.use('/users', usersRoute);

// ----- api routes -----
router.use('/api/songs', songsRoute);
router.use('/api/sets', setsRoute);

// ---- views routes -----
router.use('/', viewsRoute);

module.exports = { router };