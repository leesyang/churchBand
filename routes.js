'use strict';
const express = require('express');
const router = express.Router();

const { authCtrl, recommSongsCtrl, usersCtrl, worshipSetsCtrl } = require('./controllers');

// ----- user and auth routes -----
router.use('/login', authCtrl);
router.use('/users', usersCtrl);

// ----- api routes -----
router.use('/api/recommsongs', recommSongsCtrl);
router.use('/api/review/sets', worshipSetsCtrl);

// ---- views routes -----
router.get('/', (req, res) => {
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
});

module.exports = { router };