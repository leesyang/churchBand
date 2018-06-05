'use strict';
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

const UserSchema = new Schema({
    username: {type: String, required: true, unique: true},
    firstName: String,
    lastName: String,
    password: {type: String, require: true},
    email: {type: String, required: true, unique: true},
    profile: {
        instruments: [
            {rank: String, type: String, level: String},
            {rank: String, type: String, level: String},
            {rank: String, type: String, level: String}
        ],
        favoriteSong: {
            artist: {type: String, default: ''},
            album: {type: String, default: ''},
            title: {type: String, default: ''},
            releaseYear: Number,
        },
        songOfTheMonth: {
            artist: {type: String, default: ''},
            album: {type: String, default: ''},
            title: {type: String, default: ''},
            link: String,
        }
    }
});

const User = mongoose.model('User', UserSchema);

module.exports = { User };