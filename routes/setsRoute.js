'use strict';
const router = require('express').Router();

// ----- authentication -----
const { jwtAuth } = require('../middlewares/auth');

// ----- controllers -----
const { setsCtrl } = require('../controllers');

// ---- middlewares -----
const { newSetFieldsCheck } = require('../middlewares/fieldReqCheck');
const { uploader } = require('../middlewares/multer');
//const { uploadSetMiddle } = require('../middlewares/multer');

// ----- routes -----
// -- get list of sets --
router.get('/', setsCtrl.getListOfSets);

function route(req, res, next) {
    console.log(req.files);
    console.log(req.body);
    next();
}

// -- add a new set --
router.post('/', jwtAuth, route, uploader.Set, newSetFieldsCheck, setsCtrl.addNewSet);

// -- get list of comments ---
router.get('/:setId/comments', setsCtrl.getComments);

// -- add a comment to a set --
router.post('/:setId/comments', jwtAuth, setsCtrl.addNewComment);

// -- update a comment, only if you are the owner --
router.put('/:setId/comments', jwtAuth, setsCtrl.updateComment);

// -- remove a comment, only if you are the owner --
router.delete('/:setId/comments', jwtAuth, setsCtrl.deleteComment);


module.exports = { router };