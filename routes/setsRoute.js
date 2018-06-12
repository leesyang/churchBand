'use strict';
const express = require('express');
const router = express.Router();
const passport = require('passport');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

// ----- authentication -----
const { jwtAuth } = require('../middlewares/auth');

// ----- controllers -----
const { setsCtrl } = require('../controllers');

// ---- middlewares -----
router.use(jsonParser);
const { newSetFieldsCheck } = require('../middlewares/fieldReqCheck');

// ----- routes -----
// -- get list of sets --
router.get('/', setsCtrl.getListOfSets);

// -- add a new set --
router.post('/', jwtAuth, newSetFieldsCheck, setsCtrl.addNewSet);

// -- get list of comments ---
router.get('/:setId/comments', setsCtrl.getComments);

// -- add a comment to a set --
router.post('/:setId/comments', jwtAuth, setsCtrl.addNewComment);

// -- update a comment, only if you are the owner --
router.put('/:setId/comments', jwtAuth, setsCtrl.updateComment);

// -- remove a comment, only if you are the owner --
router.delete('/:setId/comments', jwtAuth, setsCtrl.deleteComment);


module.exports = { router };