'use strict';
// ----- imports -----
const { User } = require('../models');

// ----- exports -----
const usersCtrl = {};

usersCtrl.console = function (req, res) {
    console.log('users controller is working');
};

usersCtrl.addNewUser = function (req, res) {
  let { username, password, firstName, lastName, email } = req.body;

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
    })
    .catch(err => console.log(err));
  })
  .then(user => {
    return res.status(201);
  })
  .catch(err => {
    console.log(err);
    res.json(err);
  });
};

module.exports = usersCtrl;