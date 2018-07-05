'use strict';
const ejs = require('ejs');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

// ----- ultility functions -----
const { songsUtil }  = require('./songsCtrl');

// ---- imports ----
const { User } = require('../models')

// ----- exports -----
const viewsCtrl = {};

viewsCtrl.login = function(req, res) {
    res.render('pages/login');
};

viewsCtrl.register = function(req, res) {
    res.render('pages/register');
}


viewsCtrl.home = function (req, res) {
    User.findById(req.user.id)
    .then(user => {
        const loggedInUser = Object.assign({}, user.serialize())
        return loggedInUser;
    })
    .then(user => {
        console.log(user);
        res.render('pages/home', { user: user })
    })
}


module.exports = viewsCtrl;
