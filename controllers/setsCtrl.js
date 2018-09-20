'use strict';
// ---- imports ----
const { Set } = require('../models');

// ----- exports -----
const setsCtrl = {};

// ----- common functions -----
const filterUserInfo = '-password -firstName -lastName -email -__v';

// ----- utility function -----
let setUtil = {};

setUtil.getSetPromise = (setId) => {
    return Set.findById(setId)
    .populate('addedBy', filterUserInfo)
    .populate('comments.addedBy', filterUserInfo)
}

// -- get list of all sets --
setsCtrl.getListOfSets = function(req, res) {
    Set.find({})
    .populate('comments.addedBy', filterUserInfo)
    .then(results => res.status(200).json(results))
    .catch(err => console.log(err));
};

// -- add a new set --
setsCtrl.addNewSet = function(req, res) {
    console.log(req.body);
    let files = [];

    if (req.files) {
        Object.keys(req.files).map(key => {
            files.push({
                src: req.files[key][0].key.substring(10),
                name: req.files[key][0].fieldname
            })
        });
    }

    let bandMembers = [];

    let { eventDate, eventType, mainLead, mainSpeaker, setPart } = req.body;

    Object.keys(req.body).map(key => {
        
        if (key.slice(0,3) === 'mem') {
            bandMembers.push({
                instrument: key.substr(3),
                name: req.body[key]
            })
        }
    })

    let set = new Set({
        eventDate,
        eventType,
        mainLead,
        mainSpeaker,
        bandMembers,
        files,
        setPart
    });

    set.save()
    .then(set => res.status(201).json(set))
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
    setUtil.getSetPromise(req.params.setId)
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
                res.status(202).json(updatedComment.commentsOnly());
            })
            .catch(err => console.log(err));
        }
        else {
            res.status(403).json({
                code: 403,
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
            set.save()
            .then(() => res.status(204).end())
            .catch(err => console.log(err));
        }
        else {
            res.status(403).json({
                code: 403,
                reason: 'Denied',
                message: 'Unable to delete. Not Authorized.',
            })
        }
    })
};

module.exports = setsCtrl;