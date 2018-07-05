'use strict';
const router = require('express').Router();
const jsonParser = require('body-parser').json();

// ----- auth -----
const { jwtAuth } = require('../middlewares/auth');

// ----- controllers -----
const { usersCtrl } = require('../controllers');

// ----- middleware -----
router.use(jsonParser);
const { newUserInputCheck } = require('../middlewares/fieldReqCheck');
const { uploader } = require('../middlewares/multer');

// ----- routes -----
// -- create new user --
router.post('/', newUserInputCheck, usersCtrl.addNewUser );

router.put('/', jwtAuth, uploader.ProfilePic, usersCtrl.updateUser);

module.exports = { router };