'use strict';
// ----- models ----
const { Song } = require('../models');

// ----- imports -----

// ----- exports -----
const songsCtrl = {};

// ----- functions -----
songsCtrl.console = function (req, res) {
    console.log('songs controller is working');
}

/// -- get list of songs --
songsCtrl.getListOfSongs = function(req, res) {
    Song.find({})
        .then(_res => res.json(_res))
        .catch((err) => console.log(err));
};

// -- post a new songs --
songsCtrl.addNewSong = function(req, res) {
    const newSongPost = req.body;

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
};

// -- add a new comment --
songsCtrl.addNewComment = function(req, res) {
    const newPost = req.body;
    const comment = {
        addedBy: req.body.addedBy, comment: req.body.comment
    };
    
    Song.findOneAndUpdate({_id: req.params.songId},{$push:{comments: comment}})
    .then(post => res.status(201).end());
}

songsCtrl.getComments = function(req, res) {
    Song.findById({_id: req.params.songId})
    .then(post => res.status(200).json(post.serialize()));
}

module.exports = songsCtrl;