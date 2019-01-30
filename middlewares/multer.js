'use strict';
const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const shortid = require('shortid');

// ----- exports -----
const uploader = {};

// ----- configuring amazon web services ------
var s3 = new aws.S3({ /* ... */ })
aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const myBucket = process.env.S3_BUCKET_NAME;

// ---- utility function -----
const generateId = () => {
  return shortid.generate();
}

// ----- helper functions ----
const stringCombine = (string) => {
    return string.toLowerCase()
    .split(' ')
    .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
    .join('_');
}

// ----- amazon storage settings -----
const setStorageAws = multerS3({
  s3: s3,
  bucket: myBucket,
  acl: 'public-read',
  contentType: multerS3.AUTO_CONTENT_TYPE, 
  key: function (req, file, cb) {

    let lead = stringCombine(req.body.praiseLead);
    let event = req.body.event;
    let date = req.body.date;
    let part = req.body.part;

    let originalName = file.originalname;

    const ext = file.originalname.match(/\.\w*/g)[0];
    let uniqueId = generateId();

    cb(null, `set-audio/${date}_${event}_${lead}/` + originalName);
  }
});

const profileStorageAws = multerS3({
  s3: s3,
  bucket: myBucket,
  acl: 'public-read',
  contentType: multerS3.AUTO_CONTENT_TYPE, 
  key: function (req, file, cb) {
    let ext = file.originalname.slice(-4);
    cb(null, 'user-profile-images/' + file.fieldname + '-' + Date.now() + ext);
  }
});

const uploadPicAws = multer({ storage: profileStorageAws });
const uploadSetAws = multer({ storage: setStorageAws });

uploader.ProfilePic = uploadPicAws.single('userImg');
uploader.Set = uploadSetAws.any();

module.exports = { uploader };