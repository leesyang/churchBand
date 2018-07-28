'use strict';
// ----- imports -----
const { User } = require('../models');

// ----- exports -----
const usersCtrl = {};

// ---- user utility functions -----

usersCtrl.getListOfUsers = function (req, res) {
  return User.find({})
  .then(users => {
    res.status(200).json(users.serialize());
  })
};

usersCtrl.addNewUser = function (req, res) {
  let { username, password, firstName, lastName, email, profilePicture } = req.body;
  firstName = firstName.trim();
  lastName = lastName.trim();

  return User.find({ username }).count()
  .then(count => {
    if (count > 0) {
      return Promise.reject({
        code: 422,
        reason: 'ValidationError',
        message: 'Username already taken',
        location: 'username'
      });
    }
    return User.find({ email }).count()
  })
  .then(count => {
    if (count > 0) {
      return Promise.reject({
        code: 422,
        reason: 'ValidationError',
        message: 'Email already taken',
        location: 'email'
      })
    }
    return User.hashPassword(password);
  })
  .then(hash => {
    return User.create({
      username,
      password: hash,
      firstName,
      lastName,
      email,
      profilePicture
    });
  })
  .then(user => {
    return res.status(201).json(user.serialize());
  })
  .catch(err => {
    if (err.reason === 'ValidationError') {
      return res.status(err.code).json(err);
    }
    console.log(err);
    res.status(500).json({code: 500, message: 'Internal server error'});
  });
};

usersCtrl.updateUser = function (req, res) {
  let updateInfo = { 
    experience: {}
  };

  Object.keys(req.body).forEach(function(key, index) {
    if (key in req.user && req.body[key] != req.user[key]) {
      updateInfo[key] = req.body[key];
    }
    if (!( key in req.user)) {
      updateInfo.experience[key] = req.body[key];
    }
  });

  if (req.file) {
    updateInfo.profilePicture = req.file.key.substring(20);
  }

  if (updateInfo.email) {
    return User.find({ email: updateInfo.email })
    .count()
    .then(count => {
      if (count > 0 ) {
        return Promise.reject({
          code: 422,
          reason: 'ValidationError',
          message: 'Email already taken',
          location: 'email'
        })
      }
    })
    .catch(err => {
      if (err) {
        res.status(422).json(err);
      }
    })
  }

  return User.findByIdAndUpdate(req.user.id, updateInfo, { new: true })
  .then(user => {
    res.status(201).json(user.serialize());
  })
  .catch(err => {
    res.status(500).json({
      code: 500,
      message: 'Database Error'
    })
  })
}

module.exports = usersCtrl;