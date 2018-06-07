'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const setsSchema = new Schema({
    title: String
});

const Set = mongoose.model('Set', setsSchema);

module.exports = { Set };