'use strict';
const router = require('express').Router();

// ----- auth -----
const { jwtAuth } = require('../middlewares/auth');

// ----- controllers -----
const { usersCtrl } = require('../controllers');

// ----- middleware -----
const { newUserInputCheck } = require('../middlewares/fieldReqCheck');
const { uploader } = require('../middlewares/multer');

// ----- routes -----
router.get('/', jwtAuth, usersCtrl.getListOfUsers )

// -- create new user --
router.post('/', newUserInputCheck, usersCtrl.addNewUser );

// -- update user info --
router.put('/', jwtAuth, uploader.ProfilePic, usersCtrl.updateUser);

module.exports = { router };