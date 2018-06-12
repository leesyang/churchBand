'use strict';
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

const setCommentSchema = new Schema({
    addedBy: { type: ObjectId, ref:'User' },
    dateAdded: { type: Date, default: Date.now() },
    comment: String
});

const setsSchema = new Schema({
    dateAdded: { type: String, default: Date.now() },
    eventDate: String,
    eventType: String,
    mainLead: /* { type: ObjectId, ref:'User' } */ String,
    mainSpeaker: String,
    bandMembers: /* [{ type: ObjectId, ref: 'User' }] */ String,
    file: String,
    comments: [ setCommentSchema ]
});

setsSchema.methods.commentsOnly = function () {
    return this.comments;
}


const Set = mongoose.model('Set', setsSchema);

module.exports = { Set };