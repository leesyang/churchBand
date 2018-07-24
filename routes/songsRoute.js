'use strict';
const router = require('express').Router();

// ----- authentication -----
const { jwtAuth } = require('../middlewares/auth');

// ----- controllers -----
const { songsCtrl } = require('../controllers');

// ----- middleware -----
const { 
    newSongFieldsCheck, 
    updateComFieldCheck,
    newComFieldCheck,
    deleteComFieldCheck } = require('../middlewares/fieldReqCheck');

// ----- routes -----
// -- get a list of songs --
router.get('/', songsCtrl.getListOfSongs);

// -- add a new song --
router.post('/', jwtAuth, newSongFieldsCheck, songsCtrl.addNewSong);

// -- add a new comment to a song --
router.post('/:songId/comments', newComFieldCheck, jwtAuth, songsCtrl.addNewComment); 

// -- get all comments from a song --
router.get('/:songId/comments', songsCtrl.getComments);

// -- update comment of a song --
router.put('/:songId/comments', jwtAuth, updateComFieldCheck, songsCtrl.updateComment);

// -- delete comment of a song, only for user who posted comment --
router.delete('/:songId/comments', jwtAuth, deleteComFieldCheck, songsCtrl.deleteComment);

module.exports = { router };