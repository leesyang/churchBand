'use strict';
const multer = require('multer');

// ----- exports -----
const uploader = {};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, '../churchband/public/images/user_profile');
    },
    filename: function (req, file, cb) {
        let ext = '';
        (file.mimetype === 'image/png')? ext = '.png' : null;
        (file.mimetype === 'image/jpeg')? ext = '.jpeg': null;
        cb(null, file.fieldname + '-' + Date.now() + ext);
    }
  });

const upload = multer( { storage: storage } );

uploader.ProfilePic = upload.single('userImg');

module.exports = { uploader };