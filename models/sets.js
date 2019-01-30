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
    dateAdded: { type: Date, default: Date.now() },
    eventDate: { type: Date },
    eventType: String,
    mainLead: String,
    mainSpeaker: String,
    setPart: String,
    bandMembers: Array,
    awsKey: String,
    files: Array,
    dbUpdatedFlag: { type: Number, default: 0 },
    comments: [ setCommentSchema ]
});

setsSchema.methods.commentsOnly = function () {
    return this.comments;
}


const Set = mongoose.model('Set', setsSchema);

module.exports = { Set };