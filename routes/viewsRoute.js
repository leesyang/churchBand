'use strict';
const express = require('express');
const router = express.Router();

// ---- authentication -----
const { jwtAuth } = require('../middlewares/auth');

// ----- controllers -----
const { viewsCtrl } = require('../controllers')

// ----- routes -----
router.get('/', viewsCtrl.login);

router.get('/register', viewsCtrl.register);

router.get('/home', jwtAuth, viewsCtrl.home)

router.get('/recommendations', jwtAuth, (req, res) => {
    console.log('generate a view');
    res.send('recommendations page');
});

router.get('/myprofile', jwtAuth, (req, res) => {
    console.log('generate a view');
    res.send('myprofile page');
});

router.get('/review', jwtAuth, (req, res) => {
    console.log('generate a view');
    res.send('review page');
});

router.get('/about', jwtAuth, (req, res) => {
    console.log('generate a view');
    res.send('about page');
});

module.exports = { router };