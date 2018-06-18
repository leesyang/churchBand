'use strict';
const ejs = require('ejs');

// ----- ultility functions -----
const { songsUtil }  = require('./songsCtrl');

// ----- exports -----
const viewsCtrl = {};

viewsCtrl.login = function(req, res) {
    res.render('pages/login', { message: req.flash('loginMessage')});
};

viewsCtrl.register = function(req, res) {
    res.render('pages/register');
}

viewsCtrl.home = function (req, res) {
    res.render('pages/home');
}


module.exports = viewsCtrl;
