'use strict';
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
mongoose.Promise = global.Promise;

// ----- authentication -----
const { isCurrentUser, jwtAuth } = require('../middlewares/auth');

// ----- controllers -----
const { songsCtrl } = require('../controllers');

// ----- middleware -----
router.use(jsonParser);
const { 
    newSongFieldsCheck, 
    updateComFieldCheck } = require('../middlewares/fieldReqCheck');

// ----- routes -----
// -- get a list of songs --
router.get('/', songsCtrl.getListOfSongs);

// -- add a new song --
router.post('/', newSongFieldsCheck, songsCtrl.addNewSong);

// -- add a new comment to a song --
router.post('/:songId/comments', songsCtrl.addNewComment); 

// -- get all comments from a song --
router.get('/:songId/comments', songsCtrl.getComments);

// -- update comment of a song --
router.put('/:songId/comments', updateComFieldCheck, songsCtrl.updateComment);

// -- delete comment of a song, only for user who posted song --
router.delete('/:songId/comments', isCurrentUser, songsCtrl.deleteComment);

module.exports = { router };