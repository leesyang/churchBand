'use strict';
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

const skillSchema = new Schema({
    instrument: String,
    skill: String,
    yearsOfExp: Number,
});

const profileSchema = new Schema({
    experience: {type: Array},
    yearsOnBand: Number,
    favorite: {
        artist: String,
        album: {
            title: String,
            artist: String,
            releaseYear: {type: String, default: ''}
        },
        song: {
            title: {type: String, default: ''},
            artist: {type: String, default: ''},
            album: {type: String, default: ''},
            releaseYear: {type: String, default: ''}
        }
    },
    songOfTheMonth: {
        artist: {type: String, default: ''},
        album: {type: String, default: ''},
        title: {type: String, default: ''},
        releaseYear: Number,
        youtubelink: String,
    }
})

const userSchema = new Schema({
    username: {type: String, required: true, unique: true},
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    password: {type: String, require: true},
    email: {type: String, required: true, unique: true},
    profilePicture: {type: String, default: ''},
    profile: profileSchema
});

userSchema.methods.serialize = function() {
    return {
        username: this.username,
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        profilePicture: this.profilePicture
    };
};

userSchema.statics.hashPassword = function(password) {
    return bcrypt.hash(password, 10);
};

userSchema.methods.validatePassword = function(password) {
    return bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = { User };