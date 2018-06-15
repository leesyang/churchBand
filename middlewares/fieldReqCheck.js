'use strict';
// ----- imports -----
const { checkReq } = require('../common/common');

// ----- users routes -----
const newUserInputCheck = function(req, res, next) {
  console.log(req.body);
    const fieldIs = {
        required: ['username', 'password'],
        string: ['username', 'password', 'firstName', 'lastName'],
        explicityTrimmed: ['username', 'password'],
        sizedFields: {
          username: { min: 2 },
          password: { min: 10, max: 72 }
      }
    };
    
      const isMissing = checkReq.missingFields(fieldIs.required, req.body);
      if (isMissing) {
        req.flash('registerMessage', isMissing.message)
        return res.redirect('/register');
      }

      const isNonString = checkReq.nonStringFields(fieldIs.string, req.body);
      const hasWhitespace = checkReq.whitespaceFields(fieldIs.explicityTrimmed, req.body);
      const improperlySized = checkReq.improperlySizedFields(fieldIs.sizedFields, req.body);

      const fieldError = [isNonString, hasWhitespace, improperlySized];
      for (let i = 0; i < fieldError.length; i++) {
        if(fieldError[i]) {
          req.flash('registerMessage', fieldError[i].message);
          return res.redirect('/register');
        }
      };

      next();
};

// ----- songs route -----
const newSongFieldsCheck = function(req, res, next) {
  const fieldIs = {
      required: ['artist', 'title']
  };
  
    const isMissing = checkReq.missingFields(fieldIs.required, req.body);
    if (isMissing) {
      return res.status(isMissing.code).json(isMissing);
    }

    next();
};

const updateComFieldCheck = function(req, res, next) {
  const fieldIs = {
    required: ['commentId', 'comment']
  };

  const isMissing = checkReq.missingFields(fieldIs.required, req.body);
  if (isMissing) {
    return res.status(isMissing.code).json(isMissing);
  }

  next();
};

const deleteComFieldCheck = function(req, res, next) {
  const fieldIs = {
    required: ['commentId']
  };

  const isMissing = checkReq.missingFields(fieldIs.required, req.body);
  if (isMissing) {
    return res.status(isMissing.code).json(isMissing);
  }

  next();
};

const newSetFieldsCheck = function(req, res, next) {
  const fieldIs = {
    required: ['eventDate', 'mainLead', 'file', 'bandMembers']
  };

  const isMissing = checkReq.missingFields(fieldIs.required, req.body);
  if (isMissing) {
    return res.status(isMissing.code).json(isMissing);
  }

  next();
};


module.exports = { 
  newUserInputCheck, 
  newSongFieldsCheck, 
  updateComFieldCheck,
  deleteComFieldCheck,
  newSetFieldsCheck };