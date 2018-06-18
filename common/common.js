'use strict';
const checkReq = {}

checkReq.missingFields = function(expectedFields, reqBody) {
    let missingField = expectedFields.find(field => !(field in reqBody));
    if(missingField) {
        return {
            code: 422,
            reason: 'ValidationError',
            message: 'Missing field',
            location: missingField
        }
    }
};

checkReq.nonStringFields = function(expectedFields, reqBody) {
    const nonStringField = expectedFields.find(
        field => field in reqBody && typeof reqBody[field] !== 'string'
      );
    
      if (nonStringField) {
        return {
          code: 422,
          reason: 'ValidationError',
          message: 'Incorrect field type: expected string',
          location: nonStringField
        };
      };
};

checkReq.whitespaceFields = function(expectedFields, reqBody) {
    const nonTrimmedField = expectedFields.find(
        field => reqBody[field] && (reqBody[field].trim() !== reqBody[field])
        );
      
        if (nonTrimmedField) {
            return {
                code: 422,
                reason: 'ValidationError',
                message: 'Cannot start or end with whitespace',
                location: nonTrimmedField
            };
        };
};


checkReq.improperlySizedFields = function(sizedFields, reqBody) {
    const tooSmallField = Object.keys(sizedFields).find(
      field =>
        'min' in sizedFields[field] &&
              reqBody[field].trim().length < sizedFields[field].min
    );
    
    const tooLargeField = Object.keys(sizedFields).find(
      field =>
        'max' in sizedFields[field] &&
              reqBody[field].trim().length > sizedFields[field].max
    );
  
    if (tooSmallField || tooLargeField) {
      return {
        code: 422,
        reason: 'ValidationError',
        message: tooSmallField
          ? `${tooSmallField.charAt(0).toUpperCase()+tooSmallField.slice(1)} must be at least ${sizedFields[tooSmallField]
            .min} characters long`
          : `${tooLargeField.charAt(0).toUpperCase()+tooLargeField.slice(1)} must be at most ${sizedFields[tooLargeField]
            .max} characters long`,
        location: tooSmallField || tooLargeField
      };
    };
}

module.exports = { checkReq };