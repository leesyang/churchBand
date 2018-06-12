'use strict';
// ----- models ----
const { Song } = require('../models');

// ----- imports -----

// ----- exports -----
const songsCtrl = {};

// ----- common functions -----
// -- populate user --
const filterUserInfo = '-password -firstName -lastName -email -__v';

// ----- functions -----
/// -- get list of songs --
songsCtrl.getListOfSongs = function(req, res) {
    Song.find({})
    .populate('addedBy', filterUserInfo)
    .populate('comments.addedBy', filterUserInfo)
    .then(_res => res.status(200).json(_res))
    .catch((err) => console.log(err));
};

// -- post a new songs --
songsCtrl.addNewSong = function(req, res) {
    let newSongPost = req.body;
    console.log(req.user);

    let song = new Song({
        addedBy: req.user.id,
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
        addedBy: req.user.id,
        comment: req.body.comment,
    };

    console.log(comment);
    
    Song.findOneAndUpdate({_id: req.params.songId},{$push:{comments: comment}})
    .then(post => res.status(201).end())
    .catch(err => console.log(err));
};

// -- get list of comments --
songsCtrl.getComments = function(req, res) {
    Song.findById({_id: req.params.songId})
    .populate('comments.addedBy', '-password -firstName -lastName -email -__v')
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
            res.json({
                code: 422,
                reason: 'Denied',
                message: 'Unable to modify. Not Authorized.',
            })
        }
    })
}

songsCtrl.deleteComment = function(req, res) {
    let deleteRequestFrom = req.user.id;

    Song.findById(req.params.songId, function (err, song){
        let subDoc = song.comments.id(req.body.commentId);
        let commentOwner = subDoc.addedBy;

        if( commentOwner == deleteRequestFrom ){
            subDoc.remove();
            song.save().catch(err => console.log(err));
            res.status(204).end();
        }
        else {
            res.json({
                code: 422,
                reason: 'Denied',
                message: 'Unable to delete. Not Authorized.',
            })
        }
    })
}

module.exports = songsCtrl;