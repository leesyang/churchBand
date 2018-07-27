'use strict';
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

const userSchema = new Schema({
    username: {type: String, required: true, unique: true},
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    password: {type: String, require: true},
    email: {type: String, required: true, unique: true},
    profilePicture: {type: String, default: 'default-user-image.png'},
    experience: Object
});

userSchema.methods.serialize = function() {
    return {
        username: this.username,
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        profilePicture: this.profilePicture,
        id: this._id,
        experience: this.experience
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