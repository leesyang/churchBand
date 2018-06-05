'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

const recommSongsCommentsSchema = new Schema({
    addedby: ObjectId,
    comment: String,
});

const recommSongsSchema = new Schema({
    artist: String,
    title: String,
    dateAdded: {type: Date, default: Date.now()},
    addedBy: {type: ObjectId, ref:'User'},
    youtubeLink: String,
    spotifyLink: String,
    lyrics: String,
    rating: Number,
    comments: [recommSongsCommentsSchema],
});