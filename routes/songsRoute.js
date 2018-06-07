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

// ----- models ----
const { Song } = require('../models');

// ----- middleware -----
router.use(jsonParser);

// ----- routes -----
router.get('/', songsCtrl.console);

router.post('/', (req,res) => {
    const newPost = req.body;
    console.log(newPost);
    const song = new Song({
        artist: req.body.artist,
        title: req.body.title,
        links: {
            youtube: req.body.youtube,
            spotify: req.body.spotify,
        }
    });
    song.save((err, res) => {
        console.log(res);
    })
});


router.post('/comments', (req,res) => {
    const newPost = req.body;
    console.log(newPost);
    const comment = {addedBy: req.body.addedBy, comment: req.body.comment};
    Song.findOneAndUpdate({_id: req.body.id},{$push:{comments: comment}})
    .then(res => console.log(res));
})

module.exports = { router };