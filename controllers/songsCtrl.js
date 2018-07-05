'use strict';
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

// ----- models ----
const { Song } = require('../models');

// ----- imports -----

// ----- exports -----
const songsCtrl = {};
const songsUtil = {};

// ----- common functions -----
// -- populate user --
const filterUserInfo = '-password -firstName -lastName -email -__v';

// ----- utility functions -----
songsUtil.getListOfSongsPromise = function() {
    return Song.find({})
    .populate('addedBy', filterUserInfo)
    .populate('comments.addedBy', filterUserInfo)
};

songsUtil.getSongPromise = function(songId) {
    return Song.findById({_id: songId})
    .populate('addedBy', filterUserInfo)
    .populate('comments.addedBy', filterUserInfo)
};

// ----- route controllers -----
// -- get list of songs --
songsCtrl.getListOfSongs = function(req, res) {
    songsUtil.getListOfSongsPromise()
    .then(_res => res.status(200).json(_res))
    .catch((err) => {
        if(err) {
            res.status(500).json({ code: 500, message: 'Internal Server Error'})
        }
        console.log(err)
    });
};

// -- post a new songs --
songsCtrl.addNewSong = function(req, res) {
    const { artist, album, title, theme, releaseYear, tempo, youtube } = req.body;
    const addedBy = req.user.id;
    let song = new Song({
        addedBy,
        album,
        artist,
        title,
        links: {
            youtube: youtube,
        },
        theme,
        releaseYear,
        tempo
    });
    song.save()
    .then(song => {
        songsUtil.getSongPromise(song._id)
        .then(_song => {
            res.status(201).json(_song);
        })
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            code: 500,
            message: 'Internal Server Error'
        })
    })
};

// -- add a new comment --
songsCtrl.addNewComment = function(req, res) {
    const { comment } = req.body;
    const newComment = {
        addedBy: req.user.id,
        comment: comment,
    };
    Song.findOneAndUpdate({_id: req.params.songId}, {$push: {comments: newComment}}, { new: true })
    .populate('addedBy', filterUserInfo)
    .populate('comments.addedBy', filterUserInfo)
    .then(song => {
        res.status(201).json(song)
    })
    .catch(err => {
        res.status(500).json({ message: 'Database Error'});
    })
};

// -- get list of comments --
songsCtrl.getComments = function(req, res) {
    songsUtil.getSongPromise(req.params.songId)
    .then(post => res.status(200).json(post))
    .catch(err => console.log(err));
};

// -- update a comment, validate that user owns comment --
songsCtrl.updateComment = function(req, res) {
    let updatedRequestFrom = req.user.id;

    Song.findById(req.params.songId, function (err, song){
        let subDoc = song.comments.id(req.body.commentId);
        let commentOwner = subDoc.addedBy;

        if( commentOwner == updatedRequestFrom ){
            subDoc.$set({comment: req.body.comment});
            subDoc.$set({dateAdded: Date.now()});
            song.save()
            .then(function(updatedComment) {
                res.send(updatedComment.commentsOnly());
            })
            .catch(err => console.log(err));
        }
        else {
            res.status(403).json({
                code: 403,
                reason: 'Forbidden',
                message: 'Unable to modify. Not Authorized.',
            })
        }
    })
}
// -- delete a comment, validate that user owns comment --
songsCtrl.deleteComment = function(req, res) {
    console.log(req.body);
    let deleteRequestFrom = req.user.id;

    Song.findById(req.params.songId)
    .then(song => {
        let subDoc = song.comments.id(req.body.commentId);
        let commentOwner = subDoc.addedBy;
        if( commentOwner == deleteRequestFrom ){
            subDoc.remove();
            song.save().catch(err => console.log(err));
            res.status(204).end();
        }
        else {
            res.status(401).json({
                code: 401,
                reason: 'Denied',
                message: 'Unable to delete. Not Authorized.',
            })
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            code: 500,
            message: 'Internal Server Error'
        })
    })
}

module.exports = { songsCtrl, songsUtil };