'use strict';
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

const songCommentsSchema = new Schema({
    addedby: { type: ObjectId, ref:'User' },
    dateAdded: { type: Date, default: Date.now() },
    comment: String
});

const songLinkSchema = new Schema({
    youtube: String,
    spotify: String,
    other: String,
    _id: false,
    id: false,
});

const songSchema = new Schema({
    dateAdded: { type: Date, default: Date.now() },
    addedBy: { type: ObjectId, ref:'User' },
    artist: String,
    title: String,
    links: songLinkSchema,
    lyrics: String,
    rank: Number,
    comments: [ songCommentsSchema ]
});

songSchema.methods.serialize = function () {
    return this.comments;
}

const Song = mongoose.model('Song', songSchema);

module.exports = { Song };