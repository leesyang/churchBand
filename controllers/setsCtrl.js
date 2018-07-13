'use strict';
// ---- imports ----
const { Set } = require('../models');

// ----- exports -----
const setsCtrl = {};

// ----- common functions -----
const filterUserInfo = '-password -firstName -lastName -email -__v';

// -- get list of all sets --
setsCtrl.getListOfSets = function(req, res) {
    Set.find({})
    .populate('comments.addedBy', filterUserInfo)
    .then(results => res.status(200).json(results))
    .catch(err => console.log(err));
};

// -- add a new set --
setsCtrl.addNewSet = function(req, res) {
    let files = [];

    Object.keys(req.files).map(key => {
        files.push({
            src: req.files[key][0].key.substring(10),
            name: req.files[key][0].fieldname
        })
    });

    let bandMembers = [];

    let { eventDate, eventType, mainLead, mainSpeaker } = req.body;

    Object.keys(req.body).map(key => {
        
        if (key.slice(0,3) === 'mem') {
            bandMembers.push({
                instrument: key.substr(3),
                name: req.body[key]
            })
        }
    })

    console.log(files);
    
    let set = new Set({
        eventDate,
        eventType,
        mainLead,
        mainSpeaker,
        bandMembers,
        files
    });

    set.save()
    .then(results => res.status(201).json(results))
    .catch(err => console.log(err));
};

// -- add a comment to a set --
setsCtrl.addNewComment = function(req, res) {
    const comment = {
        addedBy: req.user.id,
        comment: req.body.comment,
    };

    Set.findOneAndUpdate({_id: req.params.setId},{$push:{comments: comment}}, { new: true })
    .populate('comments.addedBy', filterUserInfo)
    .then(post => res.status(201).json(post))
    .catch(err => console.log(err));
};

// -- get all comments of a set --
setsCtrl.getComments = function(req, res){
    Set.findById({_id: req.params.setId})
    .then(post => res.status(200).json(post.commentsOnly()))
    .catch(err => console.log(err));
};

// -- update comment, if owner --
setsCtrl.updateComment = function(req, res) {
    let updatedRequestFrom = req.user.id;

    Set.findById(req.params.setId, function (err, set){
        let subDoc = set.comments.id(req.body.commentId);
        let commentOwner = subDoc.addedBy;

        if( commentOwner == updatedRequestFrom ){
            subDoc.$set({comment: req.body.comment});
            subDoc.$set({dateAdded: Date.now()});
            set.save()
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
};

// -- delete comment if owner --
setsCtrl.deleteComment = function(req, res) {
    let deleteRequestFrom = req.user.id;

    Set.findById(req.params.setId, function (err, set){
        let subDoc = set.comments.id(req.body.commentId);
        let commentOwner = subDoc.addedBy;

        if( commentOwner == deleteRequestFrom ){
            subDoc.remove();
            set.save().catch(err => console.log(err));
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
};


module.exports = setsCtrl;