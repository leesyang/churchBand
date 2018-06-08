'use strict';
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
mongoose.Promise = global.Promise;

// ----- authentication -----
const { jwtAuth } = require('../middlewares/auth');

// ----- controllers -----
const { songsCtrl } = require('../controllers');

// ----- middleware -----
router.use(jsonParser);
const { newSongFieldsCheck } = require('../middlewares');


// ----- routes -----
// -- get a list of songs --
router.get('/', songsCtrl.getListOfSongs);

// -- add a new song --
router.post('/', newSongFieldsCheck, songsCtrl.addNewSong);

// -- add a new comment to a song --
router.post('/:songId/comments', songsCtrl.addNewComment);

// -- get all comments from a song --
router.get('/:songId/comments', songsCtrl.getComments);

module.exports = { router };