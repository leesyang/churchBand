'use strict';
// ----- imports -----
const { checkReq } = require('../common/common');

// ----- users routes -----
const newUserInputCheck = function(req, res, next) {
      const fieldIs = {
          required: ['username', 'password', 'firstName', 'lastName', 'email'],
          string: ['username', 'password', 'firstName', 'lastName'],
          explicityTrimmed: ['username', 'password'],
          sizedFields: {
            username: { min: 2 },
            password: { min: 10, max: 72 }
        }
      };
    
      const isMissing = checkReq.missingFields(fieldIs.required, req.body);
      if (isMissing && isMissing.code) {
        return res.status(isMissing.code).json(isMissing)
      }

      const isNonString = checkReq.nonStringFields(fieldIs.string, req.body);
      const hasWhitespace = checkReq.whitespaceFields(fieldIs.explicityTrimmed, req.body);
      const improperlySized = checkReq.improperlySizedFields(fieldIs.sizedFields, req.body);

      const fieldError = [isNonString, hasWhitespace, improperlySized];
      for (let i = 0; i < fieldError.length; i++) {
        if (fieldError[i] && fieldError[i].code) {
          return res.status(fieldError[i].code).json(fieldError[i]);
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

const newComFieldCheck = function(req, res, next) {
  const fieldIs = {
    required: ['comment']
  };

  const isMissing = checkReq.missingFields(fieldIs.required, req.body);
  if (isMissing) {
    return res.status(isMissing.code).json(isMissing);
  }
  next();
}

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
    required: ['eventDate', 'eventType', 'mainLead']
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
  newComFieldCheck,
  updateComFieldCheck,
  deleteComFieldCheck,
  newSetFieldsCheck };