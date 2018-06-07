'use strict';
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
mongoose.Promise = global.Promise;

// ----- controllers -----
const { usersCtrl } = require('../controllers');

// ----- imports -----
const { User } = require('../models');

// ----- middleware -----
router.use(jsonParser);

// ----- routes -----
// -- post a new user --
router.post('/', (req, res) => {
  const requiredFields = ['username', 'password', 'email'];
  const missingField = requiredFields.find(field => !(field in req.body));

  if (missingField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Missing field',
      location: missingField
    });
  };

  const stringFields = ['username', 'password', 'firstName', 'lastName', 'email'];
  const nonStringField = stringFields.find(
    field => field in req.body && typeof req.body[field] !== 'string'
  );

  if (nonStringField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Incorrect field type: expected string',
      location: nonStringField
    });
  };

  const explicityTrimmedFields = ['username', 'password'];
  const nonTrimmedField = explicityTrimmedFields.find(
  field => req.body[field].trim() !== req.body[field]
  );

  if (nonTrimmedField) {
      return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Cannot start or end with whitespace',
      location: nonTrimmedField
      });
  }
/* 
  const sizedFields = {
      username: {
      min: 2
      },
      password: {
      min: 10,
      max: 72
      }
  };

  const tooSmallField = Object.keys(sizedFields).find(
    field =>
      'min' in sizedFields[field] &&
            req.body[field].trim().length < sizedFields[field].min
  );
  
  const tooLargeField = Object.keys(sizedFields).find(
    field =>
      'max' in sizedFields[field] &&
            req.body[field].trim().length > sizedFields[field].max
  );

  if (tooSmallField || tooLargeField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: tooSmallField
        ? `Must be at least ${sizedFields[tooSmallField]
          .min} characters long`
        : `Must be at most ${sizedFields[tooLargeField]
          .max} characters long`,
      location: tooSmallField || tooLargeField
    });
  };
*/
  let { username, password, firstName, lastName, email } = req.body;
  console.log(req.body);
  firstName = firstName.trim();
  lastName = lastName.trim();

  return User.find({username})
  .count()
  .then(count => {
    if(count > 0){
      return Promise.reject({
        code: 422,
        reason: 'ValidationError',
        message: 'Username already taken',
        location: 'username'
      })
    }
    return User.hashPassword(password);
  })
  .then(hash => {
    User.create({
      username,
      password: hash,
      firstName,
      lastName,
      email
    });
  })
  .then(user => {
    return res.status(201);
  })
  .catch(err => {
    console.log(err);
    res.json(err);
  });
})

module.exports = { router };