'use strict';
exports.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost/churchband';
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb://localhost/jwt-auth-demo';
exports.PORT = process.env.PORT || 8080;