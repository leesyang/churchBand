'use strict';
exports.DATABASE_URL = process.env.DATABASE_URL;
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL;
exports.PORT = process.env.PORT;

// ----- authentication via passport -----
exports.JWT_SECRET = process.env.JWT_SECRET;
exports.JWT_EXPIRY = process.env.JWT_EXPIRY;