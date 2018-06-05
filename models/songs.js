'use strict';
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

const songCommentsSchema = new Schema({
    addedby: {type: ObjectId, ref:'User'},
    comment: String,
});

const SongSchema = new Schema({
    artist: String,
    title: String,
    dateAdded: {type: Date, default: Date.now()},
    addedBy: {type: ObjectId, ref:'User'},
    youtubeLink: String,
    spotifyLink: String,
    lyrics: String,
    rating: Number,
    comments: [songCommentsSchema]
});


const Song = mongoose.model('song', SongSchema);

module.exports = { Song };