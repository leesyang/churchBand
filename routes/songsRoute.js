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
const { 
    newSongFieldsCheck, 
    updateComFieldCheck,
    deleteComFieldCheck } = require('../middlewares/fieldReqCheck');

// ----- routes -----
// -- get a list of songs --
router.get('/', songsCtrl.getListOfSongs);

// -- add a new song --
router.post('/', newSongFieldsCheck, songsCtrl.addNewSong);

// -- add a new comment to a song --
router.post('/:songId/comments', jwtAuth, songsCtrl.addNewComment); 

// -- get all comments from a song --
router.get('/:songId/comments', songsCtrl.getComments);

// -- update comment of a song --
router.put('/:songId/comments', jwtAuth, updateComFieldCheck, songsCtrl.updateComment);

// -- delete comment of a song, only for user who posted comment --
router.delete('/:songId/comments', jwtAuth, deleteComFieldCheck, songsCtrl.deleteComment);

module.exports = { router };