'use strict';
const ejs = require('ejs');

// ----- ultility functions -----
const { songsUtil }  = require('./songsCtrl');

// ----- exports -----
const viewsCtrl = {};

viewsCtrl.loginerror = function(req, res) {
    res.render('pages/loginerror');
};

viewsCtrl.login = function(req, res) {
    res.render('pages/login', { message: req.flash('loginMessage')});
};

viewsCtrl.register = function(req, res) {
    res.render('pages/register', { message: req.flash('registerMessage') });
}

viewsCtrl.home = function (req, res) {
    res.render('pages/home.ejs');
}


module.exports = viewsCtrl;
